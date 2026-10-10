import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma, config } from '../../config';
import { getSocketIO } from '../../socket';
import {
  DepositEvaluation,
  FeeDeductionEvaluation,
  RegisterBloodBankDto,
  OutreachMessageResult,
  CreateSubagentDto,
  AgencyLoginDto,
} from './bloodBank.types';

export * from './bloodBank.types';

export const MINIMUM_INITIAL_DEPOSIT = config.emergencyRules.initialBloodBankDepositBdt;
export const OUTREACH_MESSAGE_FEE = config.emergencyRules.outreachMessageFeeBdt;

/**
 * SRP Function 1: Validates initial deposit amount boundary condition (&ge; 500 BDT)
 */
export const evaluateInitialDeposit = (depositAmount: number): DepositEvaluation => {
  if (depositAmount < MINIMUM_INITIAL_DEPOSIT) {
    return {
      approved: false,
      walletBalance: 0,
      message: `Registration rejected. Minimum initial deposit required is ${MINIMUM_INITIAL_DEPOSIT} BDT, received ${depositAmount} BDT.`,
    };
  }

  return {
    approved: true,
    walletBalance: depositAmount,
    message: `Registration approved. Application pending admin verification with initial balance of ${depositAmount} BDT.`,
  };
};

/**
 * SRP Function 2: Calculates 5 BDT outreach fee deduction and validates sufficiency
 */
export const deductOutreachFee = (currentBalance: number): FeeDeductionEvaluation => {
  if (currentBalance < OUTREACH_MESSAGE_FEE) {
    return {
      success: false,
      previousBalance: currentBalance,
      deductedAmount: 0,
      newBalance: currentBalance,
      error: `Insufficient wallet balance. Required: ${OUTREACH_MESSAGE_FEE} BDT, Available: ${currentBalance} BDT. Please top up.`,
    };
  }

  const newBalance = Math.round((currentBalance - OUTREACH_MESSAGE_FEE) * 100) / 100;

  return {
    success: true,
    previousBalance: currentBalance,
    deductedAmount: OUTREACH_MESSAGE_FEE,
    newBalance,
  };
};

/**
 * SRP Function 3: Persists blood bank and its initial deposit transaction atomically
 */
export const createBloodBankWithDeposit = async (
  dto: RegisterBloodBankDto,
  initialBalance: number
) => {
  return prisma.$transaction(async (tx) => {
    const bloodBank = await tx.bloodBank.create({
      data: {
        name: dto.name,
        licenseNumber: dto.licenseNumber,
        email: dto.email.toLowerCase().trim(),
        phone: dto.phone,
        contactPerson: dto.contactPerson,
        address: dto.address || 'Dhaka, Bangladesh',
        latitude: Number(dto.latitude ?? 23.8103),
        longitude: Number(dto.longitude ?? 90.4125),
        walletBalance: initialBalance,
        ratingScore: 5.0,
        isApproved: false, // Pending admin approval
        status: 'PENDING',
      },
    });

    const transaction = await tx.transaction.create({
      data: {
        bloodBankId: bloodBank.id,
        amount: Number(dto.initialDepositAmount),
        type: 'INITIAL_DEPOSIT',
        description: `Initial registration deposit of ${dto.initialDepositAmount} BDT`,
        status: 'COMPLETED',
      },
    });

    return { bloodBank, transaction };
  });
};

/**
 * SRP Function 4: Orchestrates blood bank registration
 */
export const registerBloodBank = async (dto: RegisterBloodBankDto) => {
  const depositEval = evaluateInitialDeposit(Number(dto.initialDepositAmount));
  if (!depositEval.approved) {
    const err: any = new Error(depositEval.message);
    err.statusCode = 400;
    err.code = 'INSUFFICIENT_INITIAL_DEPOSIT';
    throw err;
  }

  const result = await createBloodBankWithDeposit(dto, depositEval.walletBalance);

  return {
    message: depositEval.message,
    result,
  };
};

/**
 * SRP Function 5: Queries blood bank by ID
 */
export const findBloodBankById = async (id: string) => {
  const bloodBank = await prisma.bloodBank.findUnique({ where: { id } });
  if (!bloodBank) {
    const err: any = new Error('Blood Bank not found.');
    err.statusCode = 404;
    throw err;
  }
  return bloodBank;
};

/**
 * SRP Function 6: Queries target blood request by ID
 */
export const findTargetRequestById = async (requestId: string) => {
  const targetRequest = await prisma.bloodRequest.findUnique({
    where: { id: requestId },
    include: { requester: true },
  });

  if (!targetRequest) {
    const err: any = new Error('Blood request not found.');
    err.statusCode = 404;
    throw err;
  }

  return targetRequest;
};

/**
 * SRP Function 7: Executes fee deduction and transaction creation atomically
 */
export const executeFeeDeductionTransaction = async (
  bloodBankId: string,
  requestId: string,
  fee: number,
  newBalance: number
) => {
  return prisma.$transaction(async (tx) => {
    const updatedBank = await tx.bloodBank.update({
      where: { id: bloodBankId },
      data: { walletBalance: newBalance },
    });

    const transaction = await tx.transaction.create({
      data: {
        bloodBankId,
        amount: fee,
        type: 'OUTREACH_MESSAGE_FEE',
        description: `Fee for outreach message to request ${requestId}`,
        status: 'COMPLETED',
      },
    });

    return { updatedBank, transaction };
  });
};

/**
 * SRP Function 8: Emits real-time outreach socket event to requester
 */
export const emitOutreachSocket = (
  requesterId: string,
  bloodBank: { id: string; name: string; phone: string },
  requestId: string,
  message: string
) => {
  try {
    const io = getSocketIO();
    if (io) {
      io.to(`user_${requesterId}`).emit('blood_bank_outreach', {
        bloodBank,
        requestId,
        message,
        timestamp: new Date(),
      });
    }
  } catch (e) {
    // ignore
  }
};

/**
 * SRP Function 9: Orchestrates outreach message sending workflow
 */
export const sendOutreachMessage = async (
  bloodBankId: string,
  requestId: string,
  message: string
): Promise<OutreachMessageResult> => {
  const bloodBank = await findBloodBankById(bloodBankId);

  const feeEval = deductOutreachFee(bloodBank.walletBalance);
  if (!feeEval.success) {
    const err: any = new Error(feeEval.error);
    err.statusCode = 402;
    err.code = 'INSUFFICIENT_FUNDS';
    err.currentBalance = bloodBank.walletBalance;
    throw err;
  }

  const targetRequest = await findTargetRequestById(requestId);

  const result = await executeFeeDeductionTransaction(
    bloodBankId,
    requestId,
    feeEval.deductedAmount,
    feeEval.newBalance
  );

  emitOutreachSocket(
    targetRequest.requesterId,
    { id: bloodBank.id, name: bloodBank.name, phone: bloodBank.phone },
    requestId,
    message
  );

  return {
    newWalletBalance: result.updatedBank.walletBalance,
    deductedFee: feeEval.deductedAmount,
    transactionId: result.transaction.id,
  };
};

/**
 * SRP Function 10: Queries details and ledger for blood bank
 */
export const getBloodBankDetails = async (bloodBankId: string) => {
  const bloodBank = await prisma.bloodBank.findUnique({
    where: { id: bloodBankId },
    include: {
      transactions: { orderBy: { createdAt: 'desc' } },
      reviews: { orderBy: { createdAt: 'desc' } },
      subagents: true,
    },
  });

  if (!bloodBank) {
    const err: any = new Error('Blood Bank not found.');
    err.statusCode = 404;
    throw err;
  }

  return bloodBank;
};

/**
 * SRP Function 11: Lists all blood banks
 */
export const listAllBloodBanks = async () => {
  return prisma.bloodBank.findMany({
    orderBy: { ratingScore: 'desc' },
    include: {
      _count: { select: { reviews: true, subagents: true } },
    },
  });
};

/**
 * SRP Function 12: Creates a dependent subagent from the Agency side
 */
export const createSubagentForAgency = async (dto: CreateSubagentDto) => {
  const agency = await findBloodBankById(dto.agencyId);

  if (agency.isSuspended) {
    const err: any = new Error('Parent agency is suspended. Cannot create subagents.');
    err.statusCode = 403;
    throw err;
  }

  if (!agency.isApproved) {
    const err: any = new Error('Parent agency is pending admin approval.');
    err.statusCode = 403;
    throw err;
  }

  const email = dto.email.toLowerCase().trim();
  const existingUser = await prisma.user.findFirst({
    where: { email },
  });

  if (existingUser) {
    const err: any = new Error('A user with this email address already exists.');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = dto.password ? await bcrypt.hash(dto.password, 10) : await bcrypt.hash('Subagent@123', 10);

  const subagent = await prisma.user.create({
    data: {
      email,
      fullName: dto.fullName,
      firstName: dto.fullName.split(' ')[0],
      lastName: dto.fullName.split(' ').slice(1).join(' ') || '',
      phone: dto.phone,
      passwordHash,
      role: 'SUBAGENT',
      agencyId: dto.agencyId,
      permissions: dto.permissions.length > 0 ? dto.permissions : ['COORDINATE_CHATS'],
      isProfileComplete: true,
    },
  });

  return subagent;
};

/**
 * SRP Function 13: Lists subagents created by a specific agency
 */
export const listSubagentsForAgency = async (agencyId: string) => {
  return prisma.user.findMany({
    where: { agencyId, role: 'SUBAGENT' },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * SRP Function 14: Authenticates an Agency or Subagent
 */
export const loginAgencyAccount = async (dto: AgencyLoginDto) => {
  const email = dto.email.toLowerCase().trim();

  // 1. Try Agency
  const agency = await prisma.bloodBank.findUnique({ where: { email } });
  if (agency) {
    if (agency.isSuspended) {
      const err: any = new Error('This agency account is suspended by platform administration.');
      err.statusCode = 403;
      throw err;
    }

    if (!agency.isApproved) {
      const err: any = new Error('Agency registration is pending administrator approval. Please await activation email.');
      err.statusCode = 403;
      throw err;
    }

    if (!agency.passwordHash) {
      const err: any = new Error('Agency password has not been established yet. Check your activation email.');
      err.statusCode = 400;
      throw err;
    }

    const isValid = await bcrypt.compare(dto.password, agency.passwordHash);
    if (!isValid) {
      const err: any = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const token = jwt.sign(
      { id: agency.id, email: agency.email, role: 'AGENCY', agencyId: agency.id },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as any }
    );

    return { type: 'AGENCY', entity: agency, token };
  }

  // 2. Try Subagent
  const subagent = await prisma.user.findFirst({
    where: { email, role: 'SUBAGENT' },
    include: { agency: true },
  });

  if (subagent && subagent.passwordHash) {
    if (subagent.isSuspended || subagent.isBanned) {
      const err: any = new Error('Subagent account is suspended or banned.');
      err.statusCode = 403;
      throw err;
    }

    if (subagent.agency?.isSuspended) {
      const err: any = new Error('Parent agency is currently suspended.');
      err.statusCode = 403;
      throw err;
    }

    const isValid = await bcrypt.compare(dto.password, subagent.passwordHash);
    if (!isValid) {
      const err: any = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const token = jwt.sign(
      {
        id: subagent.id,
        email: subagent.email,
        role: 'SUBAGENT',
        agencyId: subagent.agencyId,
        permissions: subagent.permissions,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as any }
    );

    return { type: 'SUBAGENT', entity: subagent, token };
  }

  const err: any = new Error('Invalid agency or subagent credentials.');
  err.statusCode = 401;
  throw err;
};

// Compatibility export
export const bloodBankService = {
  register: registerBloodBank,
  sendOutreachMessage,
  getDetails: getBloodBankDetails,
  listAll: listAllBloodBanks,
  createSubagent: createSubagentForAgency,
  listSubagents: listSubagentsForAgency,
  login: loginAgencyAccount,
};
