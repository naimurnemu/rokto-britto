/**
 * UNIT TEST: Community Safety & Two-Strike Ban Policy
 * 
 * LEARNING NOTE:
 * Testing state machines and policy thresholds:
 * We test state transitions: Clean -> Flagged -> Banned -> Repeat Reports.
 * 
 * Requirements tested from Rokto Britto Specification (Page 6 - Boundary Value Testing):
 * - 1st Report: User is flagged internally, but account remains active.
 * - 2nd Report: System triggers an immediate, automated ban.
 * - 3rd Report: System ignores the request gracefully (no crash, maintains banned state).
 */

import {
  evaluateStrikePolicy,
  UserSafetyProfile,
} from '../../src/modules/report/report.service';

describe('Unit Tests: Two-Strike Automated Ban Policy Service', () => {
  it('1st Report Boundary: flags user internally with 1 strike, keep account active', () => {
    const cleanUser: UserSafetyProfile = {
      id: 'user-001',
      penaltyStrikes: 0,
      isBanned: false,
      isActive: true,
    };

    const result = evaluateStrikePolicy(cleanUser);

    expect(result.actionTaken).toBe('FLAGGED');
    expect(result.strikes).toBe(1);
    expect(result.isBanned).toBe(false);
    expect(result.isActive).toBe(true);
    expect(result.message).toContain('flagged internally');
  });

  it('2nd Report Boundary: triggers immediate, automated permanent ban', () => {
    const flaggedUser: UserSafetyProfile = {
      id: 'user-002',
      penaltyStrikes: 1, // Already has 1 strike
      isBanned: false,
      isActive: true,
    };

    const result = evaluateStrikePolicy(flaggedUser);

    expect(result.actionTaken).toBe('BANNED');
    expect(result.strikes).toBe(2);
    expect(result.isBanned).toBe(true);
    expect(result.isActive).toBe(false);
    expect(result.message).toContain('Automated permanent ban triggered');
  });

  it('3rd Report Boundary: handles gracefully when user is already banned without crash', () => {
    const alreadyBannedUser: UserSafetyProfile = {
      id: 'user-003',
      penaltyStrikes: 2,
      isBanned: true,
      isActive: false,
    };

    const result = evaluateStrikePolicy(alreadyBannedUser);

    expect(result.actionTaken).toBe('ALREADY_BANNED');
    expect(result.strikes).toBe(2);
    expect(result.isBanned).toBe(true);
    expect(result.isActive).toBe(false);
    expect(result.message).toContain('already banned');
  });
});
