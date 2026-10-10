import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthenticatedUser {
  id: string;
  phone: string;
  role: string;
  isBanned?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Support both standard Bearer token and direct x-user-id header for automated tests/dev
  const testUserId = req.headers['x-user-id'] as string;
  if (testUserId) {
    req.user = {
      id: testUserId,
      phone: (req.headers['x-user-phone'] as string) || '+8801700000000',
      role: (req.headers['x-user-role'] as string) || 'USER',
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { message: 'Authentication required. No Bearer token or credentials provided.' },
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid or expired authentication token.' },
    });
  }
}
