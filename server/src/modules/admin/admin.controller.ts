import { RequestHandler } from 'express';
import {
  getAdminStats,
  getPendingAgencyApplications,
  approveAgencyApplication,
  rejectAgencyApplication,
  getAllPlatformEntities,
  setEntitySuspensionStatus,
  getAllBloodRequestsForAdmin,
  updateBloodRequestStatusByAdmin,
} from './admin.service';

export const getStatsHandler: RequestHandler = async (_req, res, next) => {
  try {
    const stats = await getAdminStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getPendingAgenciesHandler: RequestHandler = async (_req, res, next) => {
  try {
    const agencies = await getPendingAgencyApplications();
    res.status(200).json({ success: true, data: agencies });
  } catch (error) {
    next(error);
  }
};

export const approveAgencyHandler: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await approveAgencyApplication(id);
    res.status(200).json({
      success: true,
      message: `Agency "${result.name}" approved. Activation email invitation generated.`,
      data: result,
    });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ success: false, error: { message: error.message } });
      return;
    }
    next(error);
  }
};

export const rejectAgencyHandler: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const agency = await rejectAgencyApplication(id, reason);
    res.status(200).json({
      success: true,
      message: `Agency "${agency.name}" has been rejected.`,
      data: agency,
    });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ success: false, error: { message: error.message } });
      return;
    }
    next(error);
  }
};

export const getAllEntitiesHandler: RequestHandler = async (_req, res, next) => {
  try {
    const entities = await getAllPlatformEntities();
    res.status(200).json({ success: true, data: entities });
  } catch (error) {
    next(error);
  }
};

export const setSuspensionHandler: RequestHandler = async (req, res, next) => {
  try {
    const { entityType, entityId, isSuspended, reason } = req.body;
    if (!entityType || !entityId || isSuspended === undefined) {
      res.status(400).json({
        success: false,
        error: { message: 'entityType (USER | AGENCY | SUBAGENT), entityId, and isSuspended are required.' },
      });
      return;
    }

    const updated = await setEntitySuspensionStatus({
      entityType,
      entityId,
      isSuspended: Boolean(isSuspended),
      reason,
    });

    res.status(200).json({
      success: true,
      message: `Entity successfully ${isSuspended ? 'suspended' : 'reactivated'}.`,
      data: updated,
    });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ success: false, error: { message: error.message } });
      return;
    }
    next(error);
  }
};

export const getAllRequestsHandler: RequestHandler = async (_req, res, next) => {
  try {
    const requests = await getAllBloodRequestsForAdmin();
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

export const updateRequestStatusHandler: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      res.status(400).json({ success: false, error: { message: 'Status is required.' } });
      return;
    }

    const updated = await updateBloodRequestStatusByAdmin(id, status);
    res.status(200).json({
      success: true,
      message: `Request status updated to ${status}.`,
      data: updated,
    });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ success: false, error: { message: error.message } });
      return;
    }
    next(error);
  }
};
