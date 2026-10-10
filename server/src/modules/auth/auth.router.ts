import { Router } from 'express';
import {
  registerWithEmailHandler,
  loginWithEmailHandler,
  continueWithGoogleHandler,
  completeProfileHandler,
  resetPasswordHandler,
  registerOrLoginHandler,
  getProfileHandler,
} from './auth.controller';
import { requireAuth } from '../../middlewares/auth';

const router = Router();

// Unified email registration (auto-authenticates without re-login)
router.post('/register', registerWithEmailHandler);

// Unified user login
router.post('/login', (req, res, next) => {
  if (req.body.password) {
    return loginWithEmailHandler(req, res, next);
  }
  return registerOrLoginHandler(req, res, next);
});

// Google OAuth continuation
router.post('/google', continueWithGoogleHandler);

// Complete profile onboarding
router.post('/complete-profile', completeProfileHandler);

// Password setup / reset via admin-approved token
router.post('/reset-password', resetPasswordHandler);

// Legacy session creation route
router.post('/session', registerOrLoginHandler);

// Profile retrieval
router.get('/profile', requireAuth, getProfileHandler);
router.get('/me', requireAuth, getProfileHandler);

export const authRouter = router;
export default authRouter;
