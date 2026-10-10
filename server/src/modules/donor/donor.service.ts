import { prisma } from '../../config';
import { ScheduleAppointmentDto, DonorAvailabilityDto } from './donor.types';

export * from './donor.types';

/**
 * SRP Function 1: Verifies that donor exists and is not banned
 */
export const verifyDonorEligible = async (donorId: string) => {
  const donor = await prisma.user.findUnique({ where: { id: donorId } });
  if (!donor || donor.isBanned) {
    const err: any = new Error('Banned or invalid donor cannot accept requests.');
    err.statusCode = 403;
    throw err;
  }
  return donor;
};

/**
 * SRP Function 2: Validates blood request availability for scheduling
 */
export const verifyRequestAcceptable = async (requestId: string, donorId: string) => {
  const request = await prisma.bloodRequest.findUnique({ where: { id: requestId } });
  if (!request) {
    const err: any = new Error('Blood request not found.');
    err.statusCode = 404;
    throw err;
  }
  if (request.status !== 'ACTIVE') {
    const err: any = new Error(`Request is already ${request.status}.`);
    err.statusCode = 400;
    throw err;
  }
  if (request.requesterId === donorId) {
    const err: any = new Error('You cannot accept your own blood request.');
    err.statusCode = 400;
    throw err;
  }
  return request;
};

/**
 * SRP Function 3: Upserts donor chat session appointment schedule in DB
 */
export const upsertDonorChatSchedule = async (
  requestId: string,
  donorId: string,
  requesterId: string,
  scheduledTime: string | Date
) => {
  return prisma.chatSession.upsert({
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
      requesterId,
      scheduledTime: new Date(scheduledTime),
      isFirstMessageSent: false,
    },
    include: {
      bloodRequest: true,
      donor: { select: { id: true, fullName: true, phone: true } },
    },
  });
};

/**
 * SRP Function 4: Orchestrates donor schedule acceptance workflow
 */
export const acceptRequestAndSchedule = async (
  donorId: string,
  requestId: string,
  scheduledTime: string | Date
) => {
  await verifyDonorEligible(donorId);
  const request = await verifyRequestAcceptable(requestId, donorId);
  return upsertDonorChatSchedule(requestId, donorId, request.requesterId, scheduledTime);
};

/**
 * SRP Function 5: Updates donor availability toggle in database
 */
export const updateDonorAvailability = async (
  donorId: string,
  isDonorAvailable: boolean
) => {
  return prisma.user.update({
    where: { id: donorId },
    data: { isDonorAvailable },
  });
};

// Compatibility export
export const donorService = {
  acceptRequestAndSchedule,
  updateAvailability: updateDonorAvailability,
};
