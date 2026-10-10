import { config } from './env.config';
import { prisma } from './prisma.config';

// Compatibility export
export const ENV = {
  PORT: config.app.port,
  NODE_ENV: config.app.env,
  DATABASE_URL: config.database.url,
  JWT_SECRET: config.jwt.secret,
  CLIENT_ORIGIN: config.app.clientOrigin,
  PROXIMITY_RADIUS_KM: config.emergencyRules.proximityRadiusKm,
  INITIAL_BLOOD_BANK_DEPOSIT_BDT: config.emergencyRules.initialBloodBankDepositBdt,
  OUTREACH_MESSAGE_FEE_BDT: config.emergencyRules.outreachMessageFeeBdt,
  MAX_STRIKES_BEFORE_BAN: config.emergencyRules.maxStrikesBeforeBan,
};

export { config, prisma };
export default config;
