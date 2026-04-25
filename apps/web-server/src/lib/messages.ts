import { randomUUID } from 'node:crypto';
import type {
  ContentPart,
  FilePart,
  MessageMetadata,
  MessageRole,
  UnifiedMessage,
} from '@agent-flow/core/messages';

export interface CreateMessageOptions {
  role: MessageRole;
  content: ContentPart[];
  parentUuid?: string | null;
  metadata?: MessageMetadata;
}

export function createUnifiedMessage({
  role,
  content,
  parentUuid = null,
  metadata = {},
}: CreateMessageOptions): UnifiedMessage {
  return {
    uuid: randomUUID(),
    parentUuid,
    role,
    content,
    timestamp: new Date().toISOString(),
    metadata,
  };
}

export function createTextMessage(
  role: MessageRole,
  text: string,
  options: Omit<CreateMessageOptions, 'role' | 'content'> = {},
): UnifiedMessage {
  return createUnifiedMessage({
    role,
    content: [{ type: 'text', text }],
    ...options,
  });
}

export function createUserContent(message: string, attachments: FilePart[] = []): ContentPart[] {
  return [{ type: 'text', text: message }, ...attachments];
}

export function summarizeMessages(messages: UnifiedMessage[]): string {
  return messages
    .map((message) => {
      const text = message.content
        .map((part) => {
          if (part.type === 'text') return part.text;
          if (part.type === 'tool-call') return `[tool-call:${part.toolName}]`;
          if (part.type === 'tool-result') return `[tool-result:${part.toolName}]`;
          if (part.type === 'file') return `[file:${part.mimeType}]`;
          if (part.type === 'image') return '[image]';
          return '';
        })
        .filter(Boolean)
        .join(' ');

      return `${message.role}: ${text}`.trim();
    })
    .filter(Boolean)
    .join('\n')
    .slice(0, 2_000);
}
