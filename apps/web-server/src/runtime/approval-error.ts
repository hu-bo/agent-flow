import type { parseApprovalRequiredErrorMessage } from '../lib/approval.js';

export class ApprovalRequiredError extends Error {
  readonly approval: NonNullable<ReturnType<typeof parseApprovalRequiredErrorMessage>>;

  constructor(approval: NonNullable<ReturnType<typeof parseApprovalRequiredErrorMessage>>) {
    super(
      `Approval required before running high-risk command "${approval.cmd}" in "${approval.workdir}".`,
    );
    this.name = 'ApprovalRequiredError';
    this.approval = approval;
  }
}
