import { PrismaClient } from '@prisma/client';
import { config } from './env.config';
/**
 * Singleton Pattern: Database Client Manager
 * Guarantees a single PrismaClient database connection pool exists across the runtime.
 */
export class DatabaseClient {
    static instance = null;
    constructor() { }
    static getInstance() {
        if (!DatabaseClient.instance) {
            if (global.prismaGlobalInstance) {
                DatabaseClient.instance = global.prismaGlobalInstance;
            }
            else {
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
export const prisma = DatabaseClient.getInstance();
export default prisma;
