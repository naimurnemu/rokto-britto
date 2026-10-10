import { prisma, config } from '../../config';
import { getSocketIO } from '../../socket';
import {
  Coordinates,
  CreateBloodRequestDto,
  CreateRequestWorkflowResult,
  NearbyDonorSummary,
} from './request.types';

export * from './request.types';

const EARTH_RADIUS_KM = 6371;

/**
 * SRP Function 1: Converts degrees to radians
 */
export const degreesToRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * SRP Function 2: Calculates Haversine distance between two coordinates
 */
export const calculateDistanceKm = (
  origin: Coordinates,
  destination: Coordinates
): number => {
  if (
    origin.latitude === destination.latitude &&
    origin.longitude === destination.longitude
  ) {
    return 0;
  }

  const dLat = degreesToRadians(destination.latitude - origin.latitude);
  const dLon = degreesToRadians(destination.longitude - origin.longitude);

  const lat1 = degreesToRadians(origin.latitude);
  const lat2 = degreesToRadians(destination.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const rawDistance = EARTH_RADIUS_KM * c;

  return Math.round(rawDistance * 1000) / 1000;
};

/**
 * SRP Function 3: Verifies if coordinates fall within threshold distance
 */
export const isWithinProximity = (
  origin: Coordinates,
  destination: Coordinates,
  thresholdKm = config.emergencyRules.proximityRadiusKm
): boolean => {
  const distance = calculateDistanceKm(origin, destination);
  return distance <= thresholdKm;
};

/**
 * SRP Function 4: Filters and sorts items with coordinates by distance
 */
export const filterWithinRadius = <T extends { latitude: number; longitude: number }>(
  origin: Coordinates,
  items: T[],
  thresholdKm = config.emergencyRules.proximityRadiusKm
): Array<T & { distanceKm: number }> => {
  return items
    .map((item) => {
      const distanceKm = calculateDistanceKm(origin, {
        latitude: item.latitude,
        longitude: item.longitude,
      });
      return { ...item, distanceKm };
    })
    .filter((item) => item.distanceKm <= thresholdKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
};

/**
 * SRP Function 5: Validates requester eligibility
 */
export const verifyRequesterEligible = async (requesterId: string) => {
  const requester = await prisma.user.findUnique({ where: { id: requesterId } });
  if (!requester || requester.isBanned) {
    const err: any = new Error('Banned or invalid requester cannot post requests.');
    err.statusCode = 403;
    throw err;
  }
  return requester;
};

/**
 * SRP Function 6: Queries active matching donors from database
 */
export const findEligibleMatchingDonors = async (bloodGroup: any, excludeUserId: string) => {
  return prisma.user.findMany({
    where: {
      id: { not: excludeUserId },
      bloodGroup,
      isDonorAvailable: true,
      isBanned: false,
      isActive: true,
    },
  });
};

/**
 * SRP Function 7: Persists blood request to database
 */
export const insertBloodRequestRecord = async (
  dto: CreateBloodRequestDto,
  matchingDonorsCount: number
) => {
  return prisma.bloodRequest.create({
    data: {
      requesterId: dto.requesterId,
      requiredBloodGroup: dto.requiredBloodGroup,
      unitsNeeded: Number(dto.unitsNeeded ?? 1),
      hospitalName: dto.hospitalName || 'Undisclosed Hospital',
      hospitalAddress: dto.hospitalAddress || 'Dhaka, Bangladesh',
      latitude: Number(dto.latitude),
      longitude: Number(dto.longitude),
      urgency: dto.urgency || 'EMERGENCY',
      notes: dto.notes,
      status: 'ACTIVE',
      matchingDonorsNearby: matchingDonorsCount,
    },
    include: {
      requester: {
        select: { id: true, fullName: true, phone: true },
      },
    },
  });
};

/**
 * SRP Function 8: Dispatches real-time proximity alerts via Socket.io
 */
export const emitEmergencySocketAlerts = (
  nearbyDonors: Array<{ id: string; distanceKm: number }>,
  bloodRequest: any
) => {
  try {
    const io = getSocketIO();
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
      io.to('emergency_feed').emit('new_blood_request', bloodRequest);
    }
  } catch (socketErr) {
    console.warn('[Socket Alert Warning]:', socketErr);
  }
};

/**
 * SRP Function 9: Orchestrates the create blood request workflow
 */
export const createBloodRequest = async (
  dto: CreateBloodRequestDto
): Promise<CreateRequestWorkflowResult> => {
  await verifyRequesterEligible(dto.requesterId);

  const eligibleDonors = await findEligibleMatchingDonors(
    dto.requiredBloodGroup,
    dto.requesterId
  );

  const nearbyDonors = filterWithinRadius(
    { latitude: dto.latitude, longitude: dto.longitude },
    eligibleDonors,
    config.emergencyRules.proximityRadiusKm
  );

  const bloodRequest = await insertBloodRequestRecord(dto, nearbyDonors.length);

  emitEmergencySocketAlerts(nearbyDonors, bloodRequest);

  const donorSummaries: NearbyDonorSummary[] = nearbyDonors.map((d) => ({
    id: d.id,
    fullName: d.fullName,
    bloodGroup: d.bloodGroup,
    distanceKm: d.distanceKm,
  }));

  return {
    bloodRequest,
    matchingDonorsCount: nearbyDonors.length,
    nearbyDonors: donorSummaries,
  };
};

/**
 * SRP Function 10: Queries nearby active requests within radius
 */
export const getNearbyRequests = async (
  lat: number,
  lng: number,
  radiusKm = 20.0,
  bloodGroup?: string
) => {
  const whereClause: any = { status: 'ACTIVE' };
  if (bloodGroup) {
    whereClause.requiredBloodGroup = bloodGroup;
  }

  const allActiveRequests = await prisma.bloodRequest.findMany({
    where: whereClause,
    include: {
      requester: {
        select: { id: true, fullName: true, phone: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return filterWithinRadius({ latitude: lat, longitude: lng }, allActiveRequests, radiusKm);
};

/**
 * SRP Function 11: Queries request by ID
 */
export const getRequestById = async (id: string) => {
  const request = await prisma.bloodRequest.findUnique({
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
    const err: any = new Error('Blood request not found.');
    err.statusCode = 404;
    throw err;
  }

  return request;
};

/**
 * SRP Function 12: Marks blood request status as COMPLETED
 */
export const markRequestCompleted = async (id: string, requesterId?: string) => {
  const request = await prisma.bloodRequest.findUnique({ where: { id } });
  if (!request) {
    const err: any = new Error('Blood request not found.');
    err.statusCode = 404;
    throw err;
  }

  if (requesterId && request.requesterId !== requesterId) {
    const err: any = new Error('Only the original requester can mark this request as completed.');
    err.statusCode = 403;
    throw err;
  }

  const updated = await prisma.bloodRequest.update({
    where: { id },
    data: { status: 'COMPLETED' },
  });

  try {
    const io = getSocketIO();
    if (io) {
      io.to(`request_${id}`).emit('request_status_changed', {
        requestId: id,
        status: 'COMPLETED',
      });
    }
  } catch (e) {
    // ignore
  }

  return updated;
};

// Compatibility export
export const requestService = {
  createRequest: createBloodRequest,
  getNearbyRequests,
  getRequestById,
  markCompleted: markRequestCompleted,
};
