import { ActionPrompt } from '@agent-flow/chat-ui';
import type { PendingApprovalRequest } from '../hooks/useChat';

interface PendingApprovalPromptProps {
  pendingApproval: PendingApprovalRequest;
  disabled?: boolean;
  onApprove: (decision: 'once' | 'always') => void | Promise<void>;
  onCancel: () => void | Promise<void>;
}

function buildApprovalQuestion(pendingApproval: PendingApprovalRequest): string {
  const { risk, reason } = pendingApproval;
  const normalizedRisk = risk.toUpperCase();
  if (reason?.trim()) {
    return `The agent needs ${normalizedRisk.toLowerCase()}-risk approval to continue: ${reason.trim()}`;
  }
  return `The agent needs ${normalizedRisk.toLowerCase()}-risk approval to continue this turn.`;
}

function buildApprovalDescription(pendingApproval: PendingApprovalRequest): string {
  const { command, workingDir, risk } = pendingApproval;
  return `Risk: ${risk.toUpperCase()} | Command: ${command} | Working directory: ${workingDir}`;
}

export function PendingApprovalPrompt({
  pendingApproval,
  disabled,
  onApprove,
  onCancel,
}: PendingApprovalPromptProps) {
  const promptKey = [
    pendingApproval.sessionId,
    pendingApproval.command,
    pendingApproval.workingDir,
  ].join(':');

  return (
    <ActionPrompt
      key={promptKey}
      title="Approval required"
      question={buildApprovalQuestion(pendingApproval)}
      options={[
        {
          id: 'once',
          title: 'Allow once',
          description: buildApprovalDescription(pendingApproval),
          recommended: true,
        },
        {
          id: 'always',
          title: pendingApproval.scopeType === 'project'
            ? 'Always allow in this project'
            : 'Always allow in this chat',
          description: `Remember this permission for Runner ${pendingApproval.runnerId || 'current'} in ${pendingApproval.scopeLabel ?? pendingApproval.scopeId}.`,
        },
      ]}
      defaultOptionId="once"
      submitLabel={disabled ? 'Submitting...' : 'Allow and continue'}
      cancelLabel="Cancel risky operation"
      disabled={disabled}
      onSubmit={({ optionId }) => onApprove(optionId === 'always' ? 'always' : 'once')}
      onCancel={onCancel}
    />
  );
}
