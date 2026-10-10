import { Router } from 'express';
import { submitReviewHandler } from './review.controller';

const router = Router();

// POST /api/reviews - Direct functional handler
router.post('/', submitReviewHandler);

export const reviewRouter = router;
export default reviewRouter;
