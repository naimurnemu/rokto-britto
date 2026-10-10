import { RequestHandler } from 'express';
import { getHealthStatus } from './health.service';

/**
 * Functional RequestHandler for health check
 */
export const checkHealth: RequestHandler = (req, res) => {
  const health = getHealthStatus();
  res.status(200).json(health);
};

// Compatibility export
export const healthController = {
  check: checkHealth,
};
