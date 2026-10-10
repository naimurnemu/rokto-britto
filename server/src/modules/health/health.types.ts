/**
 * Health module types and interfaces
 */

export interface MemoryStats {
  rssMb: number;
  heapTotalMb: number;
  heapUsedMb: number;
}

export interface HealthStatus {
  status: 'OK' | 'DEGRADED';
  service: string;
  uptime: number;
  environment: string;
  timestamp: string;
  memoryUsage: MemoryStats;
}
