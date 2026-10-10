import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma, config } from '../../config';
import {
  EmailRegisterDto,
  EmailLoginDto,
  GoogleAuthDto,
  CompleteProfileDto,
  ResetPasswordDto,
  RegisterOrLoginDto,
  TokenPayload,
  AuthSessionResult,
} from './auth.types';

export * from './auth.types';

/**
 * SRP: Queries a user record by email address
 */
export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { agency: true },
  });
};

/**
 * SRP: Queries a user record by unique ID
 */
export const findUserById = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { agency: true },
  });
};

/**
 * SRP: Queries a user record by phone number
 */
export const findUserByPhone = async (phone: string) => {
  return prisma.user.findUnique({
    where: { phone },
    include: { agency: true },
  });
};

/**
 * SRP: Hashes a plain-text password securely with bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * SRP: Compares a plain password against an encrypted hash
 */
export const verifyPassword = async (password: string, hash?: string | null): Promise<boolean> => {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
};

/**
 * SRP: Validates that an existing user is not banned or suspended
 */
export const validateUserAccessStatus = (user: { isBanned: boolean; isSuspended?: boolean; suspendedReason?: string | null }) => {
  if (user.isBanned) {
    const err: any = new Error('This account has been permanently banned due to community abuse strikes.');
    err.statusCode = 403;
    throw err;
  }
  if (user.isSuspended) {
    const reasonMsg = user.suspendedReason ? `: ${user.suspendedReason}` : '';
    const err: any = new Error(`This account has been suspended by the System Administrator${reasonMsg}.`);
    err.statusCode = 403;
    throw err;
  }
};

/**
 * SRP: Signs and generates a JWT authentication token
 */
export const generateAuthToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });
};

/**
 * SRP: Registers a new user with email and password without requiring immediate sign-in
 */
export const registerUserWithEmail = async (dto: EmailRegisterDto): Promise<AuthSessionResult> => {
  const normalizedEmail = dto.email.toLowerCase().trim();

  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    const err: any = new Error('An account with this email address already exists.');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await hashPassword(dto.password);

  const newUser = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      role: 'FINDER',
      isProfileComplete: false,
      isDonorAvailable: false,
      penaltyStrikes: 0,
      isBanned: false,
      isSuspended: false,
    },
    include: { agency: true },
  });

  const token = generateAuthToken({
    id: newUser.id,
    email: newUser.email,
    phone: newUser.phone,
    role: newUser.role,
    agencyId: newUser.agencyId,
    permissions: newUser.permissions,
    isBanned: newUser.isBanned,
    isSuspended: newUser.isSuspended,
  });

  return {
    user: newUser,
    token,
    isProfileComplete: false,
  };
};

/**
 * SRP: Authenticates an existing user via email and password
 */
export const loginUserWithEmail = async (dto: EmailLoginDto): Promise<AuthSessionResult> => {
  const normalizedEmail = dto.email.toLowerCase().trim();
  const user = await findUserByEmail(normalizedEmail);

  if (!user || !user.passwordHash) {
    const err: any = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const isValidPassword = await verifyPassword(dto.password, user.passwordHash);
  if (!isValidPassword) {
    const err: any = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  validateUserAccessStatus(user);

  const token = generateAuthToken({
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
    agencyId: user.agencyId,
    permissions: user.permissions,
    isBanned: user.isBanned,
    isSuspended: user.isSuspended,
  });

  return {
    user,
    token,
    isProfileComplete: user.isProfileComplete,
  };
};

/**
 * SRP: Authenticates or auto-registers a user via Google OAuth flow
 */
export const continueWithGoogle = async (dto: GoogleAuthDto): Promise<AuthSessionResult> => {
  const normalizedEmail = dto.email.toLowerCase().trim();
  let user = await findUserByEmail(normalizedEmail);

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        fullName: dto.name || 'Google User',
        googleId: dto.googleId,
        role: 'FINDER',
        isProfileComplete: false,
        isDonorAvailable: false,
      },
      include: { agency: true },
    });
  } else {
    validateUserAccessStatus(user);
    if (!user.googleId && dto.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: dto.googleId },
        include: { agency: true },
      });
    }
  }

  const token = generateAuthToken({
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
    agencyId: user.agencyId,
    permissions: user.permissions,
    isBanned: user.isBanned,
    isSuspended: user.isSuspended,
  });

  return {
    user,
    token,
    isProfileComplete: user.isProfileComplete,
  };
};

/**
 * SRP: Completes user profile with hemoglobin, profession, dob, gender, and location
 */
export const completeUserProfile = async (dto: CompleteProfileDto) => {
  const existingUser = await findUserById(dto.userId);
  if (!existingUser) {
    const err: any = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  const fullName = `${dto.firstName.trim()} ${dto.lastName.trim()}`.trim();
  const dateOfBirth = new Date(dto.dateOfBirth);

  const updatedUser = await prisma.user.update({
    where: { id: dto.userId },
    data: {
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      fullName,
      phone: dto.phone || existingUser.phone,
      dateOfBirth,
      gender: dto.gender,
      bloodGroup: dto.bloodGroup,
      hemoglobin: dto.hemoglobin !== undefined && dto.hemoglobin !== null ? Number(dto.hemoglobin) : null,
      profession: dto.profession,
      locationType: dto.locationType || 'MANUAL',
      address: dto.address,
      latitude: dto.latitude !== undefined ? Number(dto.latitude) : existingUser.latitude,
      longitude: dto.longitude !== undefined ? Number(dto.longitude) : existingUser.longitude,
      isDonorAvailable: dto.isDonorAvailable !== undefined ? dto.isDonorAvailable : existingUser.isDonorAvailable,
      role: dto.isDonorAvailable ? 'DONOR' : existingUser.role,
      isProfileComplete: true,
    },
    include: { agency: true },
  });

  return updatedUser;
};

/**
 * SRP: Resets account password using a validated security token
 */
export const resetPasswordWithToken = async (dto: ResetPasswordDto) => {
  const now = new Date();

  // Check in User model
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: dto.token,
      resetPasswordExpires: { gt: now },
    },
  });

  if (user) {
    const passwordHash = await hashPassword(dto.newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
    return { success: true, message: 'Password has been successfully updated.' };
  }

  // Check in BloodBank model
  const agency = await prisma.bloodBank.findFirst({
    where: {
      resetPasswordToken: dto.token,
      resetPasswordExpires: { gt: now },
    },
  });

  if (agency) {
    const passwordHash = await hashPassword(dto.newPassword);
    await prisma.bloodBank.update({
      where: { id: agency.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
    return { success: true, message: 'Agency password has been successfully established.' };
  }

  const err: any = new Error('Invalid or expired password reset token.');
  err.statusCode = 400;
  throw err;
};

/**
 * SRP: Legacy phone-based register or login workflow (for backward compatibility)
 */
export const registerOrLoginUser = async (dto: RegisterOrLoginDto): Promise<AuthSessionResult> => {
  let user: any = null;

  if (dto.phone) {
    user = await findUserByPhone(dto.phone);
  } else if (dto.email) {
    user = await findUserByEmail(dto.email);
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        phone: dto.phone,
        email: dto.email,
        fullName: dto.fullName || 'User',
        bloodGroup: dto.bloodGroup || 'A_POSITIVE',
        role: dto.role ?? 'FINDER',
        agencyId: dto.role === 'SUBAGENT' ? dto.agencyId : null,
        permissions: dto.role === 'SUBAGENT' ? dto.permissions ?? ['COORDINATE_CHATS'] : [],
        latitude: dto.latitude ?? 23.8103,
        longitude: dto.longitude ?? 90.4125,
        isDonorAvailable: dto.role === 'DONOR',
        penaltyStrikes: 0,
        isBanned: false,
        isSuspended: false,
      },
      include: { agency: true },
    });
  } else {
    validateUserAccessStatus(user);
    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { latitude: dto.latitude, longitude: dto.longitude },
        include: { agency: true },
      });
    }
  }

  const token = generateAuthToken({
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
    agencyId: user.agencyId,
    permissions: user.permissions,
    isBanned: user.isBanned,
    isSuspended: user.isSuspended,
  });

  return { user, token, isProfileComplete: user.isProfileComplete };
};

/**
 * SRP: Queries user profile details with associated requests and sessions
 */
export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      agency: true,
      bloodRequests: { orderBy: { createdAt: 'desc' } },
      donorChatSessions: true,
    },
  });

  if (!user) {
    const err: any = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  return user;
};

// Compatibility export
export const authService = {
  registerWithEmail: registerUserWithEmail,
  loginWithEmail: loginUserWithEmail,
  continueWithGoogle,
  completeProfile: completeUserProfile,
  resetPassword: resetPasswordWithToken,
  registerOrLogin: registerOrLoginUser,
  getProfile: getUserProfile,
};
