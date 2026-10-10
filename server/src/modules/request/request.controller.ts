import { RequestHandler } from 'express';
import {
  createBloodRequest,
  getNearbyRequests,
  getRequestById,
  markRequestCompleted,
} from './request.service';

/**
 * Functional RequestHandler: Create blood request
 */
export const createRequestHandler: RequestHandler = async (req, res, next) => {
  try {
    const requesterId = req.user?.id || req.body.requesterId;
    const {
      requiredBloodGroup,
      unitsNeeded,
      hospitalName,
      hospitalAddress,
      latitude,
      longitude,
      urgency,
      notes,
    } = req.body;

    if (!requesterId || !requiredBloodGroup || latitude === undefined || longitude === undefined) {
      res.status(400).json({
        success: false,
        error: { message: 'Requester ID, Blood Group, and Hospital Location (lat/lng) are required.' },
      });
      return;
    }

    const result = await createBloodRequest({
      requesterId,
      requiredBloodGroup,
      unitsNeeded,
      hospitalName,
      hospitalAddress,
      latitude,
      longitude,
      urgency,
      notes,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({
        success: false,
        error: { message: error.message },
      });
      return;
    }
    next(error);
  }
};

/**
 * Functional RequestHandler: Query nearby requests within radius
 */
export const getNearbyRequestsHandler: RequestHandler = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radiusKm = parseFloat(req.query.radius as string) || 20.0;
    const bloodGroup = req.query.bloodGroup as string;

    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({
        success: false,
        error: { message: 'Latitude (lat) and Longitude (lng) query parameters are required.' },
      });
      return;
    }

    const requests = await getNearbyRequests(lat, lng, radiusKm, bloodGroup);
    res.json({
      success: true,
      data: requests,
      count: requests.length,
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Functional RequestHandler: Get request by ID
 */
export const getRequestByIdHandler: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await getRequestById(id);
    res.json({ success: true, data: request });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ success: false, error: { message: error.message } });
      return;
    }
    next(error);
  }
};

/**
 * Functional RequestHandler: Mark request as completed
 */
export const markRequestCompletedHandler: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requesterId = req.user?.id;
    const updated = await markRequestCompleted(id, requesterId);

    res.json({
      success: true,
      data: updated,
      message: 'Blood request successfully marked as completed.',
    });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ success: false, error: { message: error.message } });
      return;
    }
    next(error);
  }
};

// Compatibility export
export const requestController = {
  create: createRequestHandler,
  getNearby: getNearbyRequestsHandler,
  getById: getRequestByIdHandler,
  markCompleted: markRequestCompletedHandler,
};
