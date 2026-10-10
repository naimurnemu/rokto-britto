/**
 * Admin module types and interfaces
 */

export interface SuspendEntityDto {
  entityType: 'USER' | 'AGENCY' | 'SUBAGENT';
  entityId: string;
  isSuspended: boolean;
  reason?: string;
}

export interface AgencyApprovalResult {
  agencyId: string;
  name: string;
  email: string;
  status: 'APPROVED' | 'REJECTED';
  resetToken?: string;
  activationEmailSent: boolean;
  activationUrl?: string;
}

export interface AdminStatsSummary {
  totalUsers: number;
  totalDonors: number;
  totalAgencies: number;
  pendingAgencies: number;
  totalSubagents: number;
  activeRequests: number;
  totalSuspended: number;
}
