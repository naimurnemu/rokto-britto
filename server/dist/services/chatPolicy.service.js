"use strict";
/**
 * Anti-Spam Chat Protocol Service
 *
 * Rules:
 * 1. Donors must select a schedule to initiate a chat session.
 * 2. Strict 1-Message Limit for initial contact:
 *    - 1st Message Sent: Delivered successfully, flags isFirstMessageSent = true.
 *    - Attempted 2nd Message (even via direct API call): Strictly rejected with 403 Forbidden.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInitialMessagePermission = validateInitialMessagePermission;
function validateInitialMessagePermission(session) {
    if (!session.scheduledTime) {
        return {
            allowed: false,
            reason: 'Donors must select an agreed schedule before initiating a chat session.',
        };
    }
    if (session.isFirstMessageSent) {
        return {
            allowed: false,
            reason: 'Anti-Spam Protocol: You have already sent your initial message. Additional messages are blocked until the requester responds.',
        };
    }
    return {
        allowed: true,
    };
}
