"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBloodRequest = createBloodRequest;
exports.getNearbyRequests = getNearbyRequests;
exports.markRequestCompleted = markRequestCompleted;
exports.getRequestById = getRequestById;
const prisma_1 = require("../config/prisma");
const distance_service_1 = require("../services/distance.service");
const socket_1 = require("../socket");
async function createBloodRequest(req, res) {
    try {
        const requesterId = req.user?.id || req.body.requesterId;
        const { requiredBloodGroup, unitsNeeded = 1, hospitalName, hospitalAddress, latitude, longitude, urgency = 'EMERGENCY', notes, } = req.body;
        if (!requesterId || !requiredBloodGroup || latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                success: false,
                error: { message: 'Requester ID, Blood Group, and Hospital Location (lat/lng) are required.' },
            });
        }
        // Verify requester is not banned
        const requester = await prisma_1.prisma.user.findUnique({ where: { id: requesterId } });
        if (!requester || requester.isBanned) {
            return res.status(403).json({
                success: false,
                error: { message: 'Banned or invalid requester cannot post requests.' },
            });
        }
        // Find all active, non-banned donors matching the blood group (excluding the requester)
        const eligibleDonors = await prisma_1.prisma.user.findMany({
            where: {
                id: { not: requesterId },
                bloodGroup: requiredBloodGroup,
                isDonorAvailable: true,
                isBanned: false,
                isActive: true,
            },
        });
        // Calculate which donors fall strictly within the 20km radius
        const nearbyDonors = (0, distance_service_1.filterWithinRadius)({ latitude, longitude }, eligibleDonors, 20.0);
        // Persist the blood request
        const bloodRequest = await prisma_1.prisma.bloodRequest.create({
            data: {
                requesterId,
                requiredBloodGroup,
                unitsNeeded: Number(unitsNeeded),
                hospitalName: hospitalName || 'Undisclosed Hospital',
                hospitalAddress: hospitalAddress || 'Dhaka, Bangladesh',
                latitude: Number(latitude),
                longitude: Number(longitude),
                urgency,
                notes,
                status: 'ACTIVE',
                matchingDonorsNearby: nearbyDonors.length,
            },
            include: {
                requester: {
                    select: { id: true, fullName: true, phone: true },
                },
            },
        });
        // Real-time dispatch: Emit socket proximity alert to all matching donors within 20km
        try {
            const io = (0, socket_1.getSocketIO)();
            if (io) {
                nearbyDonors.forEach((donor) => {
                    io.to(`user_${donor.id}`).emit('emergency_blood_alert', {
                        requestId: bloodRequest.id,
                        bloodGroup: bloodRequest.requiredBloodGroup,
                        hospitalName: bloodRequest.hospitalName,
                        urgency: bloodRequest.urgency,
                        distanceKm: donor.distanceKm,
                        createdAt: bloodRequest.createdAt,
                    });
                });
                // Also broadcast to public emergency room
                io.to('emergency_feed').emit('new_blood_request', bloodRequest);
            }
        }
        catch (socketErr) {
            console.warn('[Socket Alert Warning]:', socketErr);
        }
        return res.status(201).json({
            success: true,
            data: {
                bloodRequest,
                matchingDonorsCount: nearbyDonors.length,
                nearbyDonors: nearbyDonors.map((d) => ({
                    id: d.id,
                    fullName: d.fullName,
                    bloodGroup: d.bloodGroup,
                    distanceKm: d.distanceKm,
                })),
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { message: error.message || 'Error creating blood request.' },
        });
    }
}
async function getNearbyRequests(req, res) {
    try {
        const lat = parseFloat(req.query.lat);
        const lng = parseFloat(req.query.lng);
        const radiusKm = parseFloat(req.query.radius) || 20.0;
        const bloodGroup = req.query.bloodGroup;
        if (isNaN(lat) || isNaN(lng)) {
            return res.status(400).json({
                success: false,
                error: { message: 'Latitude (lat) and Longitude (lng) query parameters are required.' },
            });
        }
        const whereClause = {
            status: 'ACTIVE',
        };
        if (bloodGroup) {
            whereClause.requiredBloodGroup = bloodGroup;
        }
        const allActiveRequests = await prisma_1.prisma.bloodRequest.findMany({
            where: whereClause,
            include: {
                requester: {
                    select: { id: true, fullName: true, phone: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const nearbyRequests = (0, distance_service_1.filterWithinRadius)({ latitude: lat, longitude: lng }, allActiveRequests, radiusKm);
        return res.json({
            success: true,
            data: nearbyRequests,
            count: nearbyRequests.length,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { message: error.message || 'Error fetching nearby blood requests.' },
        });
    }
}
async function markRequestCompleted(req, res) {
    try {
        const { id } = req.params;
        const requesterId = req.user?.id;
        const request = await prisma_1.prisma.bloodRequest.findUnique({ where: { id } });
        if (!request) {
            return res.status(404).json({ success: false, error: { message: 'Blood request not found.' } });
        }
        // Verify requester ownership if user context is provided
        if (requesterId && request.requesterId !== requesterId) {
            return res.status(403).json({
                success: false,
                error: { message: 'Only the original requester can mark this request as completed.' },
            });
        }
        const updated = await prisma_1.prisma.bloodRequest.update({
            where: { id },
            data: { status: 'COMPLETED' },
        });
        // Notify socket rooms
        try {
            const io = (0, socket_1.getSocketIO)();
            if (io) {
                io.to(`request_${id}`).emit('request_status_changed', {
                    requestId: id,
                    status: 'COMPLETED',
                });
            }
        }
        catch (e) {
            // ignore
        }
        return res.json({
            success: true,
            data: updated,
            message: 'Blood request successfully marked as completed.',
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { message: error.message || 'Error completing blood request.' },
        });
    }
}
async function getRequestById(req, res) {
    try {
        const { id } = req.params;
        const request = await prisma_1.prisma.bloodRequest.findUnique({
            where: { id },
            include: {
                requester: { select: { id: true, fullName: true, phone: true } },
                chatSessions: {
                    include: {
                        donor: { select: { id: true, fullName: true } },
                        messages: true,
                    },
                },
            },
        });
        if (!request) {
            return res.status(404).json({ success: false, error: { message: 'Blood request not found.' } });
        }
        return res.json({ success: true, data: request });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: { message: error.message } });
    }
}
