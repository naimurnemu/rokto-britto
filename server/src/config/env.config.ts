import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const createConfigObject = () => ({
  app: {
    port: parseInt(process.env.PORT || '5000', 10),
    env: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
    clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/roktobritto_db?schema=public',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'rokto_britto_super_secret_jwt_key_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  },
  emergencyRules: {
    proximityRadiusKm: parseFloat(process.env.PROXIMITY_RADIUS_KM || '20.0'),
    initialBloodBankDepositBdt: parseFloat(process.env.INITIAL_BLOOD_BANK_DEPOSIT_BDT || '500.0'),
    outreachMessageFeeBdt: parseFloat(process.env.OUTREACH_MESSAGE_FEE_BDT || '5.0'),
    maxStrikesBeforeBan: parseInt(process.env.MAX_STRIKES_BEFORE_BAN || '2', 10),
  },
});

export type AppConfig = ReturnType<typeof createConfigObject>;

/**
 * Singleton Pattern: Configuration Manager
 * Ensures a single immutable configuration instance across the application lifecycle.
 */
export class ConfigManager {
  private static instance: AppConfig | null = null;

  private constructor() {}

  public static getInstance(): AppConfig {
    if (!ConfigManager.instance) {
      ConfigManager.instance = Object.freeze(createConfigObject());
    }
    return ConfigManager.instance;
  }
}

export const config: AppConfig = ConfigManager.getInstance();
export default config;
