import { prisma } from '../../config';
import { getSocketIO } from '../../socket';
export * from './chat.types';
/**
 * SRP Function 1: Validates that a schedule has been selected
 */
export const validateSchedulePresence = (scheduledTime) => {
    if (!scheduledTime) {
        return {
            allowed: false,
            reason: 'Donors must select an agreed schedule before initiating a chat session.',
        };
    }
    return { allowed: true };
};
/**
 * SRP Function 2: Validates that the first message has not yet been sent
 */
export const validateFirstMessageStatus = (isFirstMessageSent) => {
    if (isFirstMessageSent) {
        return {
            allowed: false,
            reason: 'Anti-Spam Protocol: You have already sent your initial message. Additional messages are blocked until the requester responds.',
        };
    }
    return { allowed: true };
};
/**
 * SRP Function 3: Combines schedule presence and first message checks
 */
export const validateInitialMessagePermission = (session) => {
    const scheduleCheck = validateSchedulePresence(session.scheduledTime);
    if (!scheduleCheck.allowed) {
        return scheduleCheck;
    }
    const messageCheck = validateFirstMessageStatus(session.isFirstMessageSent);
    if (!messageCheck.allowed) {
        return messageCheck;
    }
    return { allowed: true };
};
/**
 * SRP Function 4: Queries chat session by ID
 */
export const findChatSessionById = async (sessionId) => {
    const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
    });
    if (!session) {
        const err = new Error('Chat session not found.');
        err.statusCode = 404;
        throw err;
    }
    return session;
};
/**
 * SRP Function 5: Atomically saves message and sets isFirstMessageSent = true
 */
export const persistInitialMessageTransaction = async (sessionId, senderId, senderType, message) => {
    return prisma.$transaction([
        prisma.chatMessage.create({
            data: {
                chatSessionId: sessionId,
                senderId,
                senderType,
                message: message.trim(),
            },
        }),
        prisma.chatSession.update({
            where: { id: sessionId },
            data: { isFirstMessageSent: true },
        }),
    ]);
};
/**
 * SRP Function 6: Broadcasts new message to chat socket room
 */
export const emitChatMessageSocket = (sessionId, message) => {
    try {
        const io = getSocketIO();
        if (io) {
            io.to(`chat_${sessionId}`).emit('new_message', message);
        }
    }
    catch (e) {
        // ignore
    }
};
/**
 * SRP Function 7: Orchestrates sending initial chat message
 */
export const sendInitialMessage = async (sessionId, senderId, senderType, message) => {
    const session = await findChatSessionById(sessionId);
    // If sender is donor, enforce strict Anti-Spam Protocol (1-Message limit)
    if (senderType === 'DONOR' || session.donorId === senderId) {
        const permission = validateInitialMessagePermission({
            id: session.id,
            isFirstMessageSent: session.isFirstMessageSent,
            scheduledTime: session.scheduledTime,
        });
        if (!permission.allowed) {
            const err = new Error(permission.reason);
            err.statusCode = 403;
            err.code = 'ANTI_SPAM_VIOLATION';
            throw err;
        }
    }
    const [newMessage, updatedSession] = await persistInitialMessageTransaction(sessionId, senderId, senderType, message);
    emitChatMessageSocket(sessionId, newMessage);
    return {
        message: newMessage,
        session: updatedSession,
    };
};
/**
 * SRP Function 8: Queries full chat session history
 */
export const getChatSession = async (sessionId) => {
    const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
            bloodRequest: true,
            donor: { select: { id: true, fullName: true, phone: true } },
            requester: { select: { id: true, fullName: true, phone: true } },
            messages: { orderBy: { createdAt: 'asc' } },
        },
    });
    if (!session) {
        const err = new Error('Chat session not found.');
        err.statusCode = 404;
        throw err;
    }
    return session;
};
// Compatibility export
export const chatService = {
    sendInitialMessage,
    getSession: getChatSession,
};
