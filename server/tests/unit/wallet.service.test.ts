/**
 * UNIT TEST: Blood Bank Wallet Ledger & Micro-Transactions
 * 
 * LEARNING NOTE:
 * Financial transactions must be mathematically deterministic and strictly tested
 * at threshold boundaries to avoid double charging or unauthorized operations.
 * 
 * Requirements tested from Rokto Britto Specification (Page 6 - Boundary Value Testing):
 * - 499 BDT: Registration rejected for insufficient funds.
 * - 500 BDT: Registration approved, account goes live.
 * - 501 BDT: Registration approved, extra 1 BDT remains in usable wallet.
 * - Outreach Message: Costs exactly 5 BDT, blocked if balance < 5 BDT.
 */

import {
  evaluateInitialDeposit,
  deductOutreachFee,
  MINIMUM_INITIAL_DEPOSIT,
  OUTREACH_MESSAGE_FEE,
} from '../../src/modules/bloodBank/bloodBank.service';

describe('Unit Tests: Blood Bank Wallet & Ledger Service', () => {
  describe('evaluateInitialDeposit() - Onboarding Boundary Tests', () => {
    it('Boundary Case 1: 499 BDT -> Registration REJECTED for insufficient funds', () => {
      const result = evaluateInitialDeposit(499.0);

      expect(result.approved).toBe(false);
      expect(result.walletBalance).toBe(0);
      expect(result.message).toContain('Registration rejected');
    });

    it('Boundary Case 2: 500 BDT -> Registration APPROVED, account goes live', () => {
      const result = evaluateInitialDeposit(500.0);

      expect(result.approved).toBe(true);
      expect(result.walletBalance).toBe(500.0);
      expect(result.message).toContain('Registration approved');
    });

    it('Boundary Case 3: 501 BDT -> Registration APPROVED, with 501 BDT in usable wallet', () => {
      const result = evaluateInitialDeposit(501.0);

      expect(result.approved).toBe(true);
      expect(result.walletBalance).toBe(501.0);
      expect(result.message).toContain('Registration approved');
    });
  });

  describe('deductOutreachFee() - 5 BDT Messaging Fee Tests', () => {
    it('should successfully deduct exactly 5 BDT when balance is sufficient', () => {
      const startingBalance = 50.0;
      const result = deductOutreachFee(startingBalance);

      expect(result.success).toBe(true);
      expect(result.previousBalance).toBe(50.0);
      expect(result.deductedAmount).toBe(OUTREACH_MESSAGE_FEE);
      expect(result.newBalance).toBe(45.0);
    });

    it('should successfully deduct when balance is exactly 5.0 BDT (leaving 0.0 BDT)', () => {
      const startingBalance = 5.0;
      const result = deductOutreachFee(startingBalance);

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(0.0);
    });

    it('should reject outreach message if balance is below 5 BDT (e.g. 4.99 BDT)', () => {
      const insufficientBalance = 4.99;
      const result = deductOutreachFee(insufficientBalance);

      expect(result.success).toBe(false);
      expect(result.newBalance).toBe(insufficientBalance);
      expect(result.error).toContain('Insufficient wallet balance');
    });
  });
});
