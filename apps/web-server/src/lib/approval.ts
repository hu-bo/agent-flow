export type ApprovalRiskLevel = 'low' | 'medium' | 'high';

export interface ApprovalRequiredPayload {
  session_id: string;
  cmd: string;
  workdir: string;
  risk: ApprovalRiskLevel;
  reason?: string;
}
