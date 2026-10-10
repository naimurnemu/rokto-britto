"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.ENV = {
    PORT: parseInt(process.env.PORT || '5000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/roktobritto_db?schema=public',
    JWT_SECRET: process.env.JWT_SECRET || 'rokto_britto_super_secret_jwt_key_2026',
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    PROXIMITY_RADIUS_KM: parseFloat(process.env.PROXIMITY_RADIUS_KM || '20.0'),
    INITIAL_BLOOD_BANK_DEPOSIT_BDT: parseFloat(process.env.INITIAL_BLOOD_BANK_DEPOSIT_BDT || '500.0'),
    OUTREACH_MESSAGE_FEE_BDT: parseFloat(process.env.OUTREACH_MESSAGE_FEE_BDT || '5.0'),
    MAX_STRIKES_BEFORE_BAN: parseInt(process.env.MAX_STRIKES_BEFORE_BAN || '2', 10),
};
