import { RequestHandler } from 'express';
import {
  registerBloodBank,
  sendOutreachMessage,
  getBloodBankDetails,
  listAllBloodBanks,
  createSubagentForAgency,
  listSubagentsForAgency,
  loginAgencyAccount,
  OUTREACH_MESSAGE_FEE,
} from './bloodBank.service';

/**
 * Functional RequestHandler: Blood Bank registration application
 */
export const registerBloodBankHandler: RequestHandler = async (req, res, next) => {
  try {
    const {
      name,
      licenseNumber,
      email,
      phone,
      contactPerson,
      address,
      latitude,
      longitude,
      initialDepositAmount,
    } = req.body;

    if (!name || !licenseNumber || !email || !phone || initialDepositAmount === undefined) {
      res.status(400).json({
        success: false,
        error: { message: 'Name, License Number, Email, Phone, and Initial Deposit Amount are required.' },
      });
      return;
    }

    const { message, result } = await registerBloodBank({
      name,
      licenseNumber,
      email,
      phone,
      contactPerson,
      address,
      latitude,
      longitude,
      initialDepositAmount,
    });

    res.status(201).json({
      success: true,
      message,
      data: result,
    });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code || 'DEPOSIT_ERROR',
          message: error.message,
        },
      });
      return;
    }
    if (error.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: { message: 'A blood bank with this license number or email already exists.' },
      });
      return;
    }
    next(error);
  }
};

/**
 * Functional RequestHandler: Send outreach message with 5 BDT fee deduction
 */
export const sendOutreachHandler: RequestHandler = async (req, res, next) => {
  try {
    const { bloodBankId } = req.params;
    const { requestId, message } = req.body;

    if (!requestId || !message) {
      res.status(400).json({
        success: false,
        error: { message: 'Request ID and outreach message content are required.' },
      });
      return;
    }

    const result = await sendOutreachMessage(bloodBankId, requestId, message);

    res.status(200).json({
      success: true,
      message: `Outreach message dispatched. ${result.deductedFee} BDT deducted from wallet.`,
      data: result,
    });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code || 'OUTREACH_ERROR',
          message: error.message,
          currentBalance: error.currentBalance,
          requiredFee: OUTREACH_MESSAGE_FEE,
        },
      });
      return;
    }
    next(error);
  }
};

/**
 * Functional RequestHandler: Get blood bank details and ledger
 */
export const getDetailsHandler: RequestHandler = async (req, res, next) => {
  try {
    const { bloodBankId } = req.params;
    const data = await getBloodBankDetails(bloodBankId);
    res.json({ success: true, data });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ success: false, error: { message: error.message } });
      return;
    }
    next(error);
  }
};

/**
 * Functional RequestHandler: List all blood banks
 */
export const listAllHandler: RequestHandler = async (_req, res, next) => {
  try {
    const banks = await listAllBloodBanks();
    res.json({ success: true, data: banks });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Functional RequestHandler: Create subagent from the Agency side
 */
export const createSubagentHandler: RequestHandler = async (req, res, next) => {
  try {
    const agencyId = req.params.agencyId || req.body.agencyId;
    const { fullName, email, phone, password, permissions } = req.body;

    if (!agencyId || !fullName || !email) {
      res.status(400).json({
        success: false,
        error: { message: 'Agency ID, Full Name, and Email are required.' },
      });
      return;
    }

    const subagent = await createSubagentForAgency({
      agencyId,
      fullName,
      email,
      phone,
      password,
      permissions: permissions || ['COORDINATE_CHATS'],
    });

    res.status(201).json({
      success: true,
      message: 'Subagent created successfully and permissioned.',
      data: subagent,
    });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ success: false, error: { message: error.message } });
      return;
    }
    next(error);
  }
};

/**
 * Functional RequestHandler: List subagents for an agency
 */
export const listSubagentsHandler: RequestHandler = async (req, res, next) => {
  try {
    const { agencyId } = req.params;
    const subagents = await listSubagentsForAgency(agencyId);
    res.status(200).json({ success: true, data: subagents });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ success: false, error: { message: error.message } });
      return;
    }
    next(error);
  }
};

/**
 * Functional RequestHandler: Agency or Subagent Login
 */
export const loginAgencyHandler: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: { message: 'Email and password are required.' },
      });
      return;
    }

    const result = await loginAgencyAccount({ email, password });
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ success: false, error: { message: error.message } });
      return;
    }
    next(error);
  }
};

// Compatibility export
export const bloodBankController = {
  register: registerBloodBankHandler,
  sendOutreach: sendOutreachHandler,
  getDetails: getDetailsHandler,
  listAll: listAllHandler,
  createSubagent: createSubagentHandler,
  listSubagents: listSubagentsHandler,
  login: loginAgencyHandler,
};
