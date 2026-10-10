import { PrismaClient } from '@prisma/client';
import { config } from './env.config';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobalInstance: PrismaClient | undefined;
}

/**
 * Singleton Pattern: Database Client Manager
 * Guarantees a single PrismaClient database connection pool exists across the runtime.
 */
export class DatabaseClient {
  private static instance: PrismaClient | null = null;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!DatabaseClient.instance) {
      if (global.prismaGlobalInstance) {
        DatabaseClient.instance = global.prismaGlobalInstance;
      } else {
        DatabaseClient.instance = new PrismaClient({
          log: config.app.isProduction ? ['error'] : ['error', 'warn'],
        });

        if (!config.app.isProduction) {
          global.prismaGlobalInstance = DatabaseClient.instance;
        }
      }
    }
    return DatabaseClient.instance;
  }
}

export const prisma: PrismaClient = DatabaseClient.getInstance();
export default prisma;
