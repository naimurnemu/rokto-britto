import { Router } from 'express';
import { healthRouter } from './health/health.router';
import { authRouter } from './auth/auth.router';
import { requestRouter } from './request/request.router';
import { donorRouter } from './donor/donor.router';
import { chatRouter } from './chat/chat.router';
import { bloodBankRouter } from './bloodBank/bloodBank.router';
import { reportRouter } from './report/report.router';
import { reviewRouter } from './review/review.router';
import { adminRouter } from './admin/admin.router';

const router = Router();

// Mount all modular domain routers
router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/requests', requestRouter);
router.use('/donors', donorRouter);
router.use('/chats', chatRouter);
router.use('/blood-banks', bloodBankRouter);
router.use('/agencies', bloodBankRouter);
router.use('/reports', reportRouter);
router.use('/reviews', reviewRouter);
router.use('/admin', adminRouter);

export {
  healthRouter,
  authRouter,
  requestRouter,
  donorRouter,
  chatRouter,
  bloodBankRouter,
  reportRouter,
  reviewRouter,
  adminRouter,
};

export const apiRouter = router;
export default apiRouter;
