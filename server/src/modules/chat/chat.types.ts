/**
 * Chat module types and interfaces
 */

export interface ChatSessionPolicyState {
  id: string;
  isFirstMessageSent: boolean;
  scheduledTime: Date | string | null;
}

export interface MessagePermissionResult {
  allowed: boolean;
  reason?: string;
}

export interface SendMessageDto {
  sessionId: string;
  senderId: string;
  senderType: any;
  message: string;
}
