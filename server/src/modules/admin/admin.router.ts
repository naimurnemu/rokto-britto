import { Router } from 'express';
import {
  getStatsHandler,
  getPendingAgenciesHandler,
  approveAgencyHandler,
  rejectAgencyHandler,
  getAllEntitiesHandler,
  setSuspensionHandler,
  getAllRequestsHandler,
  updateRequestStatusHandler,
} from './admin.controller';

const router = Router();

// Platform stats
router.get('/stats', getStatsHandler);

// Agency approval pipeline
router.get('/agencies/pending', getPendingAgenciesHandler);
router.post('/agencies/:id/approve', approveAgencyHandler);
router.post('/agencies/:id/reject', rejectAgencyHandler);

// Platform user base & universal suspension control
router.get('/entities', getAllEntitiesHandler);
router.post('/entities/suspend', setSuspensionHandler);

// Blood emergency requests oversight
router.get('/requests', getAllRequestsHandler);
router.patch('/requests/:id/status', updateRequestStatusHandler);

export const adminRouter = router;
export default adminRouter;
