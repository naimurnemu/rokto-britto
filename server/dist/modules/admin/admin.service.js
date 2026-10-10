import crypto from 'crypto';
import { prisma } from '../../config';
export * from './admin.types';
/**
 * SRP: Calculates platform-wide summary statistics for admin overview
 */
export const getAdminStats = async () => {
    const [totalUsers, totalDonors, totalAgencies, pendingAgencies, totalSubagents, activeRequests, suspendedUsers, suspendedAgencies,] = await Promise.all([
        prisma.user.count({ where: { role: { in: ['FINDER', 'DONOR'] } } }),
        prisma.user.count({ where: { isDonorAvailable: true } }),
        prisma.bloodBank.count(),
        prisma.bloodBank.count({ where: { status: 'PENDING' } }),
        prisma.user.count({ where: { role: 'SUBAGENT' } }),
        prisma.bloodRequest.count({ where: { status: 'ACTIVE' } }),
        prisma.user.count({ where: { isSuspended: true } }),
        prisma.bloodBank.count({ where: { isSuspended: true } }),
    ]);
    return {
        totalUsers,
        totalDonors,
        totalAgencies,
        pendingAgencies,
        totalSubagents,
        activeRequests,
        totalSuspended: suspendedUsers + suspendedAgencies,
    };
};
/**
 * SRP: Fetches all agency registration requests awaiting admin approval
 */
export const getPendingAgencyApplications = async () => {
    return prisma.bloodBank.findMany({
        where: {
            OR: [
                { status: 'PENDING' },
                { isApproved: false },
            ],
        },
        orderBy: { createdAt: 'desc' },
    });
};
/**
 * SRP: Approves an agency application and dispatches a password setup reset token
 */
export const approveAgencyApplication = async (agencyId) => {
    const agency = await prisma.bloodBank.findUnique({ where: { id: agencyId } });
    if (!agency) {
        const err = new Error('Agency record not found.');
        err.statusCode = 404;
        throw err;
    }
    // Generate secure token valid for 7 days
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const updatedAgency = await prisma.bloodBank.update({
        where: { id: agencyId },
        data: {
            isApproved: true,
            status: 'APPROVED',
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetExpires,
        },
    });
    const activationUrl = `/auth/reset-password?token=${resetToken}`;
    return {
        agencyId: updatedAgency.id,
        name: updatedAgency.name,
        email: updatedAgency.email,
        status: 'APPROVED',
        resetToken,
        activationEmailSent: true,
        activationUrl,
    };
};
/**
 * SRP: Rejects an agency application with optional reason
 */
export const rejectAgencyApplication = async (agencyId, reason) => {
    const agency = await prisma.bloodBank.findUnique({ where: { id: agencyId } });
    if (!agency) {
        const err = new Error('Agency record not found.');
        err.statusCode = 404;
        throw err;
    }
    return prisma.bloodBank.update({
        where: { id: agencyId },
        data: {
            isApproved: false,
            status: 'REJECTED',
        },
    });
};
/**
 * SRP: Queries all users, agencies, and subagents across the entire platform
 */
export const getAllPlatformEntities = async () => {
    const [users, agencies] = await Promise.all([
        prisma.user.findMany({
            include: {
                agency: { select: { id: true, name: true, licenseNumber: true } },
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.bloodBank.findMany({
            include: {
                subagents: { select: { id: true, fullName: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        }),
    ]);
    return {
        users,
        agencies,
    };
};
/**
 * SRP: Suspends or reactivates any entity across the platform (User, Donor, Agency, Subagent)
 */
export const setEntitySuspensionStatus = async (dto) => {
    if (dto.entityType === 'AGENCY') {
        const agency = await prisma.bloodBank.findUnique({ where: { id: dto.entityId } });
        if (!agency) {
            const err = new Error('Target Agency not found.');
            err.statusCode = 404;
            throw err;
        }
        return prisma.bloodBank.update({
            where: { id: dto.entityId },
            data: {
                isSuspended: dto.isSuspended,
                status: dto.isSuspended ? 'SUSPENDED' : (agency.isApproved ? 'APPROVED' : 'PENDING'),
            },
        });
    }
    // USER or SUBAGENT
    const user = await prisma.user.findUnique({ where: { id: dto.entityId } });
    if (!user) {
        const err = new Error('Target User or Subagent not found.');
        err.statusCode = 404;
        throw err;
    }
    return prisma.user.update({
        where: { id: dto.entityId },
        data: {
            isSuspended: dto.isSuspended,
            suspendedReason: dto.isSuspended ? (dto.reason || 'Suspended by platform administrator') : null,
        },
    });
};
/**
 * SRP: Queries all blood requests with hospital details and urgency
 */
export const getAllBloodRequestsForAdmin = async () => {
    return prisma.bloodRequest.findMany({
        include: {
            requester: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true,
                    bloodGroup: true,
                    isBanned: true,
                    isSuspended: true,
                },
            },
            chatSessions: true,
        },
        orderBy: { createdAt: 'desc' },
    });
};
/**
 * SRP: Admin action to cancel or update emergency blood request status
 */
export const updateBloodRequestStatusByAdmin = async (requestId, status) => {
    const request = await prisma.bloodRequest.findUnique({ where: { id: requestId } });
    if (!request) {
        const err = new Error('Blood request not found.');
        err.statusCode = 404;
        throw err;
    }
    return prisma.bloodRequest.update({
        where: { id: requestId },
        data: { status },
    });
};
// Compatibility export
export const adminService = {
    getStats: getAdminStats,
    getPendingAgencies: getPendingAgencyApplications,
    approveAgency: approveAgencyApplication,
    rejectAgency: rejectAgencyApplication,
    getAllEntities: getAllPlatformEntities,
    setSuspension: setEntitySuspensionStatus,
    getAllRequests: getAllBloodRequestsForAdmin,
    updateRequestStatus: updateBloodRequestStatusByAdmin,
};
