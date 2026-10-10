/**
 * Auth module types and interfaces
 */

export type UserRole = 'FINDER' | 'DONOR' | 'AGENCY' | 'SUBAGENT' | 'ADMIN';

export type SubagentPermission =
  | 'DISPATCH_OUTREACH'
  | 'MANAGE_INVENTORY'
  | 'COORDINATE_CHATS'
  | 'VERIFY_DONORS';

export type GenderType = 'MALE' | 'FEMALE' | 'OTHER';

export type ProfessionType =
  | 'STUDENT'
  | 'EMPLOYEE'
  | 'TEACHER'
  | 'LABOR'
  | 'DOCTOR'
  | 'ENGINEER'
  | 'BUSINESS'
  | 'OTHER';

export type LocationType = 'AUTOMATIC' | 'MANUAL';

export interface EmailRegisterDto {
  email: string;
  password: string;
}

export interface EmailLoginDto {
  email: string;
  password: string;
}

export interface GoogleAuthDto {
  email: string;
  name?: string;
  googleId?: string;
}

export interface CompleteProfileDto {
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth: string | Date;
  gender: GenderType;
  bloodGroup: any;
  hemoglobin?: number; // Optional hemoglobin in g/dL (e.g. 13.5)
  profession: ProfessionType;
  locationType: LocationType;
  address?: string;
  latitude?: number;
  longitude?: number;
  isDonorAvailable?: boolean;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface RegisterOrLoginDto {
  phone?: string;
  email?: string;
  fullName?: string;
  bloodGroup?: any;
  role?: UserRole;
  agencyId?: string;
  permissions?: string[];
  latitude?: number;
  longitude?: number;
}

export interface AuthSessionResult {
  user: any;
  token: string;
  isProfileComplete?: boolean;
}

export interface TokenPayload {
  id: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  agencyId?: string | null;
  permissions?: string[];
  isBanned: boolean;
  isSuspended?: boolean;
}
