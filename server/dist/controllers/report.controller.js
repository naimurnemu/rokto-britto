"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitUserReport = submitUserReport;
exports.getUserReportHistory = getUserReportHistory;
const prisma_1 = require("../config/prisma");
const banPolicy_service_1 = require("../services/banPolicy.service");
const socket_1 = require("../socket");
async function submitUserReport(req, res) {
    try {
        const reporterId = req.user?.id || req.body.reporterId;
        const { targetUserId, reason } = req.body;
        if (!reporterId || !targetUserId || !reason) {
            return res.status(400).json({
                success: false,
                error: { message: 'Reporter ID, Target User ID, and Reason are required.' },
            });
        }
        if (reporterId === targetUserId) {
            return res.status(400).json({
                success: false,
                error: { message: 'You cannot report yourself.' },
            });
        }
        const targetUser = await prisma_1.prisma.user.findUnique({
            where: { id: targetUserId },
        });
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                error: { message: 'Reported user not found.' },
            });
        }
        // Evaluate the two-strike policy
        const policyResult = (0, banPolicy_service_1.evaluateStrikePolicy)({
            id: targetUser.id,
            penaltyStrikes: targetUser.penaltyStrikes,
            isBanned: targetUser.isBanned,
            isActive: targetUser.isActive,
        });
        // Record the report log and apply strike updates atomically
        const [report, updatedUser] = await prisma_1.prisma.$transaction([
            prisma_1.prisma.report.create({
                data: {
                    reporterId,
                    targetUserId,
                    reason,
                },
            }),
            prisma_1.prisma.user.update({
                where: { id: targetUserId },
                data: {
                    penaltyStrikes: policyResult.strikes,
                    isBanned: policyResult.isBanned,
                    isActive: policyResult.isActive,
                },
            }),
        ]);
        // If banned, notify via socket to immediately disconnect banned session
        if (policyResult.actionTaken === 'BANNED') {
            try {
                const io = (0, socket_1.getSocketIO)();
                if (io) {
                    io.to(`user_${targetUserId}`).emit('account_banned', {
                        message: 'Your account has been banned due to repeated community violations.',
                    });
                }
            }
            catch (e) {
                // ignore
            }
        }
        return res.status(200).json({
            success: true,
            data: {
                reportId: report.id,
                policyResult,
                userCurrentStatus: {
                    id: updatedUser.id,
                    penaltyStrikes: updatedUser.penaltyStrikes,
                    isBanned: updatedUser.isBanned,
                },
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { message: error.message || 'Error processing abuse report.' },
        });
    }
}
async function getUserReportHistory(req, res) {
    try {
        const { userId } = req.params;
        const reports = await prisma_1.prisma.report.findMany({
            where: { targetUserId: userId },
            include: {
                reporter: { select: { id: true, fullName: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ success: true, data: reports });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: { message: error.message } });
    }
}
