"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInitialChatMessage = sendInitialChatMessage;
exports.getChatSession = getChatSession;
const prisma_1 = require("../config/prisma");
const chatPolicy_service_1 = require("../services/chatPolicy.service");
const socket_1 = require("../socket");
async function sendInitialChatMessage(req, res) {
    try {
        const { sessionId } = req.params;
        const senderId = req.user?.id || req.body.senderId;
        const { message, senderType = 'DONOR' } = req.body;
        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: { message: 'Message content cannot be empty.' },
            });
        }
        const session = await prisma_1.prisma.chatSession.findUnique({
            where: { id: sessionId },
        });
        if (!session) {
            return res.status(404).json({
                success: false,
                error: { message: 'Chat session not found.' },
            });
        }
        // If sender is donor, enforce strict Anti-Spam Protocol (1-Message limit)
        if (senderType === 'DONOR' || session.donorId === senderId) {
            const permission = (0, chatPolicy_service_1.validateInitialMessagePermission)({
                id: session.id,
                isFirstMessageSent: session.isFirstMessageSent,
                scheduledTime: session.scheduledTime,
            });
            if (!permission.allowed) {
                return res.status(403).json({
                    success: false,
                    error: {
                        code: 'ANTI_SPAM_VIOLATION',
                        message: permission.reason,
                    },
                });
            }
        }
        // Save message and mark first message as sent atomically
        const [newMessage, updatedSession] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.chatMessage.create({
                data: {
                    chatSessionId: sessionId,
                    senderId,
                    senderType,
                    message: message.trim(),
                },
            }),
            prisma_1.prisma.chatSession.update({
                where: { id: sessionId },
                data: { isFirstMessageSent: true },
            }),
        ]);
        // Real-time broadcast
        try {
            const io = (0, socket_1.getSocketIO)();
            if (io) {
                io.to(`chat_${sessionId}`).emit('new_message', newMessage);
            }
        }
        catch (e) {
            // ignore
        }
        return res.status(201).json({
            success: true,
            data: {
                message: newMessage,
                session: updatedSession,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { message: error.message || 'Error sending chat message.' },
        });
    }
}
async function getChatSession(req, res) {
    try {
        const { sessionId } = req.params;
        const session = await prisma_1.prisma.chatSession.findUnique({
            where: { id: sessionId },
            include: {
                bloodRequest: true,
                donor: { select: { id: true, fullName: true, phone: true } },
                requester: { select: { id: true, fullName: true, phone: true } },
                messages: { orderBy: { createdAt: 'asc' } },
            },
        });
        if (!session) {
            return res.status(404).json({
                success: false,
                error: { message: 'Chat session not found.' },
            });
        }
        return res.json({
            success: true,
            data: session,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { message: error.message },
        });
    }
}
