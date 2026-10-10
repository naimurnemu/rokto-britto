/**
 * UNIT TEST: Anti-Spam Chat Protocol Service
 * 
 * LEARNING NOTE:
 * Testing security and anti-spam constraints:
 * Ensures users cannot bypass restrictions through direct API manipulation.
 * 
 * Requirements tested from Rokto Britto Specification (Page 6 - Boundary Value Testing):
 * - Anti-Spam Chat (1 Message Limit):
 *   - Donors must select a time schedule first.
 *   - 1st Message Sent: Allowed.
 *   - Attempted 2nd Message (via API hack): Strictly rejected.
 */

import {
  validateInitialMessagePermission,
  ChatSessionPolicyState,
} from '../../src/modules/chat/chat.service';

describe('Unit Tests: Anti-Spam Chat Protocol Service', () => {
  it('should block chat message if donor has not selected a schedule yet', () => {
    const sessionWithoutSchedule: ChatSessionPolicyState = {
      id: 'session-001',
      isFirstMessageSent: false,
      scheduledTime: null,
    };

    const permission = validateInitialMessagePermission(sessionWithoutSchedule);

    expect(permission.allowed).toBe(false);
    expect(permission.reason).toContain('must select an agreed schedule');
  });

  it('1st Message Sent: should allow the first message after schedule is set', () => {
    const sessionReady: ChatSessionPolicyState = {
      id: 'session-002',
      isFirstMessageSent: false,
      scheduledTime: new Date(Date.now() + 3600000), // 1 hour later
    };

    const permission = validateInitialMessagePermission(sessionReady);

    expect(permission.allowed).toBe(true);
  });

  it('Attempted 2nd Message: strictly REJECTS second message to prevent spam', () => {
    const sessionAfterFirstMessage: ChatSessionPolicyState = {
      id: 'session-003',
      isFirstMessageSent: true, // Already sent initial message
      scheduledTime: new Date(Date.now() + 3600000),
    };

    const permission = validateInitialMessagePermission(sessionAfterFirstMessage);

    expect(permission.allowed).toBe(false);
    expect(permission.reason).toContain('Anti-Spam Protocol: You have already sent your initial message');
  });
});
