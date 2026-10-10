import { prisma, config } from '../../config';
import { getSocketIO } from '../../socket';
export * from './report.types';
export const MAX_STRIKES = config.emergencyRules.maxStrikesBeforeBan;
/**
 * SRP Function 1: Validates that reporter is not reporting themselves
 */
export const validateReportTarget = (reporterId, targetUserId) => {
    if (reporterId === targetUserId) {
        const err = new Error('You cannot report yourself.');
        err.statusCode = 400;
        throw err;
    }
};
/**
 * SRP Function 2: Queries target user profile from database
 */
export const findTargetUserForReport = async (targetUserId) => {
    const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
    });
    if (!targetUser) {
        const err = new Error('Reported user not found.');
        err.statusCode = 404;
        throw err;
    }
    return targetUser;
};
/**
 * SRP Function 3: Pure function - evaluates two-strike policy state transition
 */
export const evaluateStrikePolicy = (user) => {
    if (user.isBanned) {
        return {
            actionTaken: 'ALREADY_BANNED',
            strikes: user.penaltyStrikes,
            isBanned: true,
            isActive: false,
            message: 'Account is already banned. No additional action taken.',
        };
    }
    const newStrikes = user.penaltyStrikes + 1;
    if (newStrikes >= MAX_STRIKES) {
        return {
            actionTaken: 'BANNED',
            strikes: newStrikes,
            isBanned: true,
            isActive: false,
            message: 'Automated permanent ban triggered due to 2 abuse reports.',
        };
    }
    return {
        actionTaken: 'FLAGGED',
        strikes: newStrikes,
        isBanned: false,
        isActive: true,
        message: 'User account flagged internally with warning strike. Account remains active.',
    };
};
/**
 * SRP Function 4: Persists report record and updates user strike status atomically
 */
export const persistReportTransaction = async (reporterId, targetUserId, reason, policyResult) => {
    return prisma.$transaction([
        prisma.report.create({
            data: {
                reporterId,
                targetUserId,
                reason,
            },
        }),
        prisma.user.update({
            where: { id: targetUserId },
            data: {
                penaltyStrikes: policyResult.strikes,
                isBanned: policyResult.isBanned,
                isActive: policyResult.isActive,
            },
        }),
    ]);
};
/**
 * SRP Function 5: Emits real-time account ban socket notification
 */
export const emitAccountBannedSocket = (targetUserId) => {
    try {
        const io = getSocketIO();
        if (io) {
            io.to(`user_${targetUserId}`).emit('account_banned', {
                message: 'Your account has been banned due to repeated community violations.',
            });
        }
    }
    catch (e) {
        // ignore
    }
};
/**
 * SRP Function 6: Orchestrates the user report submission workflow
 */
export const submitReport = async (reporterId, targetUserId, reason) => {
    validateReportTarget(reporterId, targetUserId);
    const targetUser = await findTargetUserForReport(targetUserId);
    const policyResult = evaluateStrikePolicy({
        id: targetUser.id,
        penaltyStrikes: targetUser.penaltyStrikes,
        isBanned: targetUser.isBanned,
        isActive: targetUser.isActive,
    });
    const [report, updatedUser] = await persistReportTransaction(reporterId, targetUserId, reason, policyResult);
    if (policyResult.actionTaken === 'BANNED') {
        emitAccountBannedSocket(targetUserId);
    }
    return {
        reportId: report.id,
        policyResult,
        userCurrentStatus: {
            id: updatedUser.id,
            penaltyStrikes: updatedUser.penaltyStrikes,
            isBanned: updatedUser.isBanned,
        },
    };
};
/**
 * SRP Function 7: Queries user report history
 */
export const getReportHistory = async (userId) => {
    return prisma.report.findMany({
        where: { targetUserId: userId },
        include: {
            reporter: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
};
// Compatibility export
export const reportService = {
    submitReport,
    getHistory: getReportHistory,
};
