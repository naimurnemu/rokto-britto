/**
 * Blood Bank module types and interfaces
 */

export interface DepositEvaluation {
  approved: boolean;
  walletBalance: number;
  message: string;
}

export interface FeeDeductionEvaluation {
  success: boolean;
  previousBalance: number;
  deductedAmount: number;
  newBalance: number;
  error?: string;
}

export interface RegisterBloodBankDto {
  name: string;
  licenseNumber: string;
  email: string;
  phone: string;
  contactPerson?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  initialDepositAmount: number;
}

export interface OutreachMessageResult {
  newWalletBalance: number;
  deductedFee: number;
  transactionId: string;
}

export interface CreateSubagentDto {
  agencyId: string;
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
  permissions: string[]; // ["DISPATCH_OUTREACH", "MANAGE_INVENTORY", "COORDINATE_CHATS", "VERIFY_DONORS"]
}

export interface AgencyLoginDto {
  email: string;
  password: string;
}
