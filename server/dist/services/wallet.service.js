"use strict";
/**
 * Blood Bank Wallet & Ledger Service
 *
 * Rules:
 * - Minimum deposit to join/activate: 500.0 BDT
 *   - 499 BDT => Rejected for insufficient funds
 *   - 500 BDT => Approved, usable wallet = 0 BDT (initial fee covers onboarding) or 500 BDT balance
 *   - 501 BDT => Approved, extra 1 BDT remains in usable balance
 * - Outreach messaging fee: 5.0 BDT deducted per message
 * - Rejects outreach message if balance < 5 BDT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OUTREACH_MESSAGE_FEE = exports.MINIMUM_INITIAL_DEPOSIT = void 0;
exports.evaluateInitialDeposit = evaluateInitialDeposit;
exports.deductOutreachFee = deductOutreachFee;
exports.MINIMUM_INITIAL_DEPOSIT = 500.0;
exports.OUTREACH_MESSAGE_FEE = 5.0;
/**
 * Validates initial deposit amount according to boundary conditions:
 * - 499 BDT -> Rejected
 * - 500 BDT -> Approved
 * - 501 BDT -> Approved
 */
function evaluateInitialDeposit(depositAmount) {
    if (depositAmount < exports.MINIMUM_INITIAL_DEPOSIT) {
        return {
            approved: false,
            walletBalance: 0,
            message: `Registration rejected. Minimum initial deposit required is ${exports.MINIMUM_INITIAL_DEPOSIT} BDT, received ${depositAmount} BDT.`,
        };
    }
    // Account approved, initial wallet balance set
    return {
        approved: true,
        walletBalance: depositAmount,
        message: `Registration approved. Account active with initial balance of ${depositAmount} BDT.`,
    };
}
/**
 * Deducts outreach fee (5 BDT) for contacting a blood requester.
 * Prevents double-charging or negative balances.
 */
function deductOutreachFee(currentBalance) {
    if (currentBalance < exports.OUTREACH_MESSAGE_FEE) {
        return {
            success: false,
            previousBalance: currentBalance,
            deductedAmount: 0,
            newBalance: currentBalance,
            error: `Insufficient wallet balance. Required: ${exports.OUTREACH_MESSAGE_FEE} BDT, Available: ${currentBalance} BDT. Please top up.`,
        };
    }
    const newBalance = Math.round((currentBalance - exports.OUTREACH_MESSAGE_FEE) * 100) / 100;
    return {
        success: true,
        previousBalance: currentBalance,
        deductedAmount: exports.OUTREACH_MESSAGE_FEE,
        newBalance,
    };
}
