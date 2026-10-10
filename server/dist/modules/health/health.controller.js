import { getHealthStatus } from './health.service';
/**
 * Functional RequestHandler for health check
 */
export const checkHealth = (req, res) => {
    const health = getHealthStatus();
    res.status(200).json(health);
};
// Compatibility export
export const healthController = {
    check: checkHealth,
};
