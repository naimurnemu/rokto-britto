import { Router } from 'express';
import {
  createRequestHandler,
  getNearbyRequestsHandler,
  getRequestByIdHandler,
  markRequestCompletedHandler,
} from './request.controller';

const router = Router();

// POST /api/requests - Direct functional handler
router.post('/', createRequestHandler);

// GET /api/requests/nearby - Direct functional handler
router.get('/nearby', getNearbyRequestsHandler);

// GET /api/requests/:id - Direct functional handler
router.get('/:id', getRequestByIdHandler);

// PATCH /api/requests/:id/complete - Direct functional handler
router.patch('/:id/complete', markRequestCompletedHandler);

export const requestRouter = router;
export default requestRouter;
