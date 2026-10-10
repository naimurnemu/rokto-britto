"use strict";
/**
 * Community Safety & Two-Strike Ban Policy Service
 *
 * Rules:
 * - 1st Report: User flagged internally (strikes = 1), remains active.
 * - 2nd Report: System triggers immediate automated ban (isBanned = true, isActive = false).
 * - 3rd+ Report: System handles gracefully without crashing or mutating already banned user.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_STRIKES = void 0;
exports.evaluateStrikePolicy = evaluateStrikePolicy;
exports.MAX_STRIKES = 2;
function evaluateStrikePolicy(user) {
    // If user is already banned, gracefully ignore to prevent double mutations / crashes
    if (user.isBanned) {
        return {
            actionTaken: 'ALREADY_BANNED',
            strikes: user.penaltyStrikes,
            isBanned: true,
            isActive: false,
            message: 'Account is already banned. No additional action taken.',
        };
    }
    const newStrikes = user.penaltyStrikes + 1;
    if (newStrikes >= exports.MAX_STRIKES) {
        // 2nd strike: Trigger immediate automated ban
        return {
            actionTaken: 'BANNED',
            strikes: newStrikes,
            isBanned: true,
            isActive: false,
            message: 'Automated permanent ban triggered due to 2 abuse reports.',
        };
    }
    // 1st strike: Flagged internally, stays active
    return {
        actionTaken: 'FLAGGED',
        strikes: newStrikes,
        isBanned: false,
        isActive: true,
        message: 'User account flagged internally with warning strike. Account remains active.',
    };
}
