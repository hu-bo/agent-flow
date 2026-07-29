export type ApprovalRiskLevel = 'low' | 'medium' | 'high';

export interface ApprovalRequiredPayload {
  request_id?: string;
  session_id: string;
  runner_id?: string;
  scope_type?: 'project' | 'chat';
  scope_id?: string;
  scope_label?: string;
  cmd: string;
  workdir: string;
  risk: ApprovalRiskLevel;
  reason?: string;
}
