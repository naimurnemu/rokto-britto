import { Router } from 'express';
import { checkHealth } from './health.controller';

const router = Router();

// GET /api/health - Direct functional handler binding
router.get('/', checkHealth);

export const healthRouter = router;
export default healthRouter;
