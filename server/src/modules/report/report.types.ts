/**
 * Report module types and interfaces
 */

export interface UserSafetyProfile {
  id: string;
  penaltyStrikes: number;
  isBanned: boolean;
  isActive: boolean;
}

export type StrikeAction = 'FLAGGED' | 'BANNED' | 'ALREADY_BANNED';

export interface BanEvaluationResult {
  actionTaken: StrikeAction;
  strikes: number;
  isBanned: boolean;
  isActive: boolean;
  message: string;
}

export interface SubmitReportResult {
  reportId: string;
  policyResult: BanEvaluationResult;
  userCurrentStatus: {
    id: string;
    penaltyStrikes: number;
    isBanned: boolean;
  };
}
