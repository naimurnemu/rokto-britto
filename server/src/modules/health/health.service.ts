import { config } from '../../config';
import { HealthStatus, MemoryStats } from './health.types';

export * from './health.types';

/**
 * SRP Function 1: Reads and converts process memory usage into megabytes.
 */
export const readMemoryStats = (): MemoryStats => {
  const memory = process.memoryUsage();
  return {
    rssMb: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
    heapTotalMb: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
    heapUsedMb: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
  };
};

/**
 * SRP Function 2: Reads server process uptime in seconds.
 */
export const readUptimeSeconds = (): number => {
  return Math.floor(process.uptime());
};

/**
 * SRP Function 3: Assembles the health status payload.
 */
export const buildHealthReport = (memory: MemoryStats, uptime: number, env: string): HealthStatus => {
  return {
    status: 'OK',
    service: 'Rokto Britto API',
    uptime,
    environment: env,
    timestamp: new Date().toISOString(),
    memoryUsage: memory,
  };
};

/**
 * SRP Function 4: Orchestrates retrieval of system health metrics.
 */
export const getHealthStatus = (): HealthStatus => {
  const memory = readMemoryStats();
  const uptime = readUptimeSeconds();
  return buildHealthReport(memory, uptime, config.app.env);
};

// Compatibility export
export const healthService = {
  getHealth: getHealthStatus,
};
