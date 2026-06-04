import { ActionPrompt } from '@agent-flow/chat-ui';
import type { PendingApprovalRequest } from '../hooks/useChat';

interface PendingApprovalPromptProps {
  pendingApproval: PendingApprovalRequest;
  disabled?: boolean;
  onApprove: () => void | Promise<void>;
  onCancel: () => void | Promise<void>;
}

function buildApprovalQuestion(pendingApproval: PendingApprovalRequest): string {
  const { risk, reason } = pendingApproval.approval;
  const normalizedRisk = risk.toUpperCase();
  if (reason?.trim()) {
    return `The agent needs ${normalizedRisk.toLowerCase()}-risk approval to continue: ${reason.trim()}`;
  }
  return `The agent needs ${normalizedRisk.toLowerCase()}-risk approval to continue this turn.`;
}

function buildApprovalDescription(pendingApproval: PendingApprovalRequest): string {
  const { cmd, workdir, risk } = pendingApproval.approval;
  return `Risk: ${risk.toUpperCase()} | Command: ${cmd} | Working directory: ${workdir}`;
}

export function PendingApprovalPrompt({
  pendingApproval,
  disabled,
  onApprove,
  onCancel,
}: PendingApprovalPromptProps) {
  const promptKey = [
    pendingApproval.approval.session_id,
    pendingApproval.approval.cmd,
    pendingApproval.approval.workdir,
  ].join(':');

  return (
    <ActionPrompt
      key={promptKey}
      title="Approval required"
      question={buildApprovalQuestion(pendingApproval)}
      options={[
        {
          id: 'approve',
          title: 'Approve and continue',
          description: buildApprovalDescription(pendingApproval),
          recommended: true,
        },
      ]}
      submitLabel={disabled ? 'Submitting...' : 'Approve and continue'}
      cancelLabel="Cancel risky operation"
      disabled={disabled}
      onSubmit={() => onApprove()}
      onCancel={onCancel}
    />
  );
}
