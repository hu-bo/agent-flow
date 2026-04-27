import { randomUUID } from 'node:crypto';
import type { AdapterMessage, MessagePart, MessageTranslator } from '../types/index.js';

interface LocalProviderResponse {
  text?: string;
  toolCall?: {
    id: string;
    name: string;
    input: unknown;
  };
}

export class LocalMessageTranslator implements MessageTranslator {
  toProviderMessages(messages: AdapterMessage[]): unknown[] {
    return messages.map((message) => ({
      id: message.id,
      role: message.role,
      parts: message.parts,
      createdAt: message.createdAt,
    }));
  }

  fromProviderResponse(response: unknown, parentId: string | null): AdapterMessage {
    const parsed = response as LocalProviderResponse;
    const parts: MessagePart[] = [];
    if (parsed.toolCall) {
      parts.push({
        type: 'tool-call',
        callId: parsed.toolCall.id,
        toolName: parsed.toolCall.name,
        args: parsed.toolCall.input,
      });
    }
    if (parsed.text) {
      parts.push({
        type: 'text',
        text: parsed.text,
      });
    }

    return {
      id: randomUUID(),
      parentId,
      role: 'assistant',
      parts,
      createdAt: new Date().toISOString(),
      meta: {},
    };
  }
}
