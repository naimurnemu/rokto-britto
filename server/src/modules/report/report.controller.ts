import { RequestHandler } from 'express';
import { submitReport, getReportHistory } from './report.service';

/**
 * Functional RequestHandler: Submit abuse report
 */
export const submitReportHandler: RequestHandler = async (req, res, next) => {
  try {
    const reporterId = req.user?.id || req.body.reporterId;
    const { targetUserId, reason } = req.body;

    if (!reporterId || !targetUserId || !reason) {
      res.status(400).json({
        success: false,
        error: { message: 'Reporter ID, Target User ID, and Reason are required.' },
      });
      return;
    }

    const result = await submitReport(reporterId, targetUserId, reason);

    res.status(200).json({
      success: true,
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

/**
 * Functional RequestHandler: Get user report history
 */
export const getReportHistoryHandler: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const history = await getReportHistory(userId);
    res.json({ success: true, data: history });
  } catch (error: any) {
    next(error);
  }
};

// Compatibility export
export const reportController = {
  submit: submitReportHandler,
  getHistory: getReportHistoryHandler,
};
