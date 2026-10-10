"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOrLoginUser = registerOrLoginUser;
exports.getProfile = getProfile;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../config/prisma");
const env_1 = require("../config/env");
async function registerOrLoginUser(req, res) {
    try {
        const { phone, fullName, bloodGroup, latitude, longitude } = req.body;
        if (!phone || !fullName || !bloodGroup) {
            return res.status(400).json({
                success: false,
                error: { message: 'Phone, Full Name, and Blood Group are required.' },
            });
        }
        let user = await prisma_1.prisma.user.findUnique({ where: { phone } });
        if (!user) {
            user = await prisma_1.prisma.user.create({
                data: {
                    phone,
                    fullName,
                    bloodGroup,
                    latitude: latitude ?? 23.8103, // Default to Dhaka center if not provided
                    longitude: longitude ?? 90.4125,
                    isDonorAvailable: true,
                    penaltyStrikes: 0,
                    isBanned: false,
                    isActive: true,
                },
            });
        }
        else {
            if (user.isBanned) {
                return res.status(403).json({
                    success: false,
                    error: { message: 'This account has been permanently banned due to community abuse strikes.' },
                });
            }
            // Update location if provided
            if (latitude !== undefined && longitude !== undefined) {
                user = await prisma_1.prisma.user.update({
                    where: { id: user.id },
                    data: { latitude, longitude },
                });
            }
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, phone: user.phone, role: user.role, isBanned: user.isBanned }, env_1.ENV.JWT_SECRET, { expiresIn: '30d' });
        return res.status(200).json({
            success: true,
            data: {
                user,
                token,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            error: { message: error.message || 'Error authenticating user.' },
        });
    }
}
async function getProfile(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                bloodRequests: { orderBy: { createdAt: 'desc' } },
                donorChatSessions: true,
            },
        });
        if (!user) {
            return res.status(404).json({ success: false, error: { message: 'User not found' } });
        }
        return res.json({ success: true, data: user });
    }
    catch (error) {
        return res.status(500).json({ success: false, error: { message: error.message } });
    }
}
