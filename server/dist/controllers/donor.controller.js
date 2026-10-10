"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptRequestAndSchedule = acceptRequestAndSchedule;
exports.updateDonorAvailability = updateDonorAvailability;
const prisma_1 = require("../config/prisma");
async function acceptRequestAndSchedule(req, res) {
    try {
        const donorId = req.user?.id || req.body.donorId;
        const { requestId, scheduledTime } = req.body;
        if (!donorId || !requestId || !scheduledTime) {
            return res.status(400).json({
                success: false,
                error: { message: 'Donor ID, Request ID, and Scheduled Time are required.' },
            });
        }
        // Verify donor is not banned
        const donor = await prisma_1.prisma.user.findUnique({ where: { id: donorId } });
        if (!donor || donor.isBanned) {
            return res.status(403).json({
                success: false,
                error: { message: 'Banned or invalid donor cannot accept requests.' },
            });
        }
        // Verify request exists and is ACTIVE
        const request = await prisma_1.prisma.bloodRequest.findUnique({ where: { id: requestId } });
        if (!request) {
            return res.status(404).json({ success: false, error: { message: 'Blood request not found.' } });
        }
        if (request.status !== 'ACTIVE') {
            return res.status(400).json({
                success: false,
                error: { message: `Request is already ${request.status}.` },
            });
        }
        if (request.requesterId === donorId) {
            return res.status(400).json({
                success: false,
                error: { message: 'You cannot accept your own blood request.' },
            });
        }
        // Create or find existing chat session with schedule
        const chatSession = await prisma_1.prisma.chatSession.upsert({
            where: {
                bloodRequestId_donorId: {
                    bloodRequestId: requestId,
                    donorId,
                },
            },
            update: {
                scheduledTime: new Date(scheduledTime),
            },
            create: {
                bloodRequestId: requestId,
                donorId,
                requesterId: request.requesterId,
                scheduledTime: new Date(scheduledTime),
                isFirstMessageSent: false,
            },
            include: {
                bloodRequest: true,
                donor: { select: { id: true, fullName: true, phone: true } },
            },
        });
        return res.status(200).json({
            success: true,
            message: 'Schedule confirmed! You may now send your single initial message to coordinate.',
            data: chatSession,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { message: error.message || 'Error scheduling donation.' },
        });
    }
}
async function updateDonorAvailability(req, res) {
    try {
        const donorId = req.user?.id || req.body.donorId;
        const { isDonorAvailable } = req.body;
        const updated = await prisma_1.prisma.user.update({
            where: { id: donorId },
            data: { isDonorAvailable: Boolean(isDonorAvailable) },
        });
        return res.json({ success: true, data: updated });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: { message: error.message } });
    }
}
