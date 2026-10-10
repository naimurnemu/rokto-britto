import { Router } from 'express';
import { submitReportHandler, getReportHistoryHandler } from './report.controller';

const router = Router();

// POST /api/reports - Direct functional handler
router.post('/', submitReportHandler);

// GET /api/reports/:userId - Direct functional handler
router.get('/:userId', getReportHistoryHandler);

export const reportRouter = router;
export default reportRouter;
