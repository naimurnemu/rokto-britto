import { RequestHandler } from 'express';
import { acceptRequestAndSchedule, updateDonorAvailability } from './donor.service';

/**
 * Functional RequestHandler: Donor scheduling
 */
export const scheduleHandler: RequestHandler = async (req, res, next) => {
  try {
    const donorId = req.user?.id || req.body.donorId;
    const { requestId, scheduledTime } = req.body;

    if (!donorId || !requestId || !scheduledTime) {
      res.status(400).json({
        success: false,
        error: { message: 'Donor ID, Request ID, and Scheduled Time are required.' },
      });
      return;
    }

    const session = await acceptRequestAndSchedule(donorId, requestId, scheduledTime);
    res.status(200).json({
      success: true,
      message: 'Schedule confirmed! You may now send your single initial message to coordinate.',
      data: session,
    });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ success: false, error: { message: error.message } });
      return;
    }
    next(error);
  }
};

/**
 * Functional RequestHandler: Toggle donor availability
 */
export const updateAvailabilityHandler: RequestHandler = async (req, res, next) => {
  try {
    const donorId = req.user?.id || req.body.donorId;
    const { isDonorAvailable } = req.body;

    if (!donorId) {
      res.status(400).json({ success: false, error: { message: 'Donor ID is required.' } });
      return;
    }

    const updated = await updateDonorAvailability(donorId, Boolean(isDonorAvailable));
    res.json({ success: true, data: updated });
  } catch (error: any) {
    next(error);
  }
};

// Compatibility export
export const donorController = {
  schedule: scheduleHandler,
  updateAvailability: updateAvailabilityHandler,
};
