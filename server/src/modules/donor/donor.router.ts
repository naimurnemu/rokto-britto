import { Router } from 'express';
import { scheduleHandler, updateAvailabilityHandler } from './donor.controller';

const router = Router();

// POST /api/donors/schedule - Direct functional handler
router.post('/schedule', scheduleHandler);

// PATCH /api/donors/availability - Direct functional handler
router.patch('/availability', updateAvailabilityHandler);

export const donorRouter = router;
export default donorRouter;
