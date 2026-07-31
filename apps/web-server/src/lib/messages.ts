import { randomBytes } from 'node:crypto';
import type {
  FilePart,
  MessageMetadata,
  MessageStatus,
  MessageRole,
  TextMessage,
  ToolExecution,
  ToolExecutionMessage,
  UnifiedMessage,
} from '@agent-flow/core/messages';

export interface CreateMessageOptions {
  role: MessageRole;
  type?: 'text' | 'tool_execution';
  text?: string;
  attachments?: FilePart[];
  tool?: ToolExecution;
  status?: MessageStatus;
  title?: string;
  stepId?: string;
  durationMs?: number;
  uuid?: string;
  parentUuid?: string | null;
  timestamp?: string;
  updatedAt?: string;
  metadata?: MessageMetadata;
}

export function createUnifiedMessage({
  role,
  type = 'text',
  text = '',
  attachments,
  tool,
  status,
  title,
  stepId,
  durationMs,
  uuid,
  parentUuid = null,
  timestamp,
  updatedAt,
  metadata = {},
}: CreateMessageOptions): UnifiedMessage {
  const base = {
    uuid: uuid ?? createMessageId(),
    parentUuid,
    role,
    timestamp: timestamp ?? new Date().toISOString(),
    ...(updatedAt ? { updatedAt } : {}),
    metadata,
  };

  if (type === 'tool_execution') {
    if (!tool) {
      throw new Error('Tool execution messages require tool data.');
    }
    return {
      ...base,
      role: 'tool',
      type,
      status: status ?? 'running',
      ...(title ? { title } : {}),
      ...(stepId ? { stepId } : {}),
      ...(durationMs !== undefined ? { durationMs } : {}),
      tool,
    };
  }

  return {
    ...base,
    type: 'text',
    text,
    ...(attachments && attachments.length > 0 ? { attachments } : {}),
  };
}

function createMessageId(): string {
  // 64-bit random id encoded as 16 lowercase hex chars.
  return randomBytes(8).toString('hex');
}

export function createTextMessage(
  role: MessageRole,
  text: string,
  options: Omit<CreateMessageOptions, 'role' | 'type' | 'text'> = {},
): TextMessage {
  return createUnifiedMessage({
    role,
    type: 'text',
    text,
    ...options,
  }) as TextMessage;
}

export function createUserTextMessage(
  text: string,
  attachments: FilePart[] = [],
  options: Omit<CreateMessageOptions, 'role' | 'type' | 'text' | 'attachments'> = {},
): TextMessage {
  return createTextMessage('user', text, {
    ...options,
    attachments,
  });
}

export function createToolExecutionMessage(
  options: Omit<CreateMessageOptions, 'role' | 'type'> & {
    tool: ToolExecution;
    status: MessageStatus;
  },
): ToolExecutionMessage {
  return createUnifiedMessage({
    ...options,
    role: 'tool',
    type: 'tool_execution',
  }) as ToolExecutionMessage;
}

export function summarizeMessages(messages: UnifiedMessage[]): string {
  return messages
    .map((message) => {
      const text = getMessageText(message);

      return `${message.role}: ${text}`.trim();
    })
    .filter(Boolean)
    .join('\n')
    .slice(0, 2_000);
}

export function getMessageText(message: UnifiedMessage): string {
  if (message.type === 'text') {
    return [
      message.text,
      ...(message.attachments ?? []).map((file) => `[file:${file.mimeType}]`),
    ]
      .filter(Boolean)
      .join(' ');
  }

  if (message.type === 'thinking') {
    return message.text;
  }

  if (message.type === 'image') {
    return message.text ?? '[image]';
  }

  const status = message.status === 'error' || message.tool.error ? 'failed' : message.status;
  return `[tool:${message.tool.name} ${status}]`;
}
