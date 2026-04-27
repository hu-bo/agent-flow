import { randomUUID } from 'node:crypto';
import { jsonSchema } from 'ai';
import type { AdapterMessage, MessagePart, MessageTranslator, ToolChoice, ToolSpec } from '../types/index.js';

interface AiSdkProviderResponse {
  text?: string;
  toolCalls?: Array<{ toolCallId: string; toolName: string; args: unknown }>;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
}

export class AiSdkMessageTranslator implements MessageTranslator {
  toProviderMessages(messages: AdapterMessage[]): unknown[] {
    const result: unknown[] = [];

    for (const msg of messages) {
      if (msg.role === 'system' || msg.role === 'developer') continue;

      if (msg.role === 'assistant') {
        result.push({
          role: 'assistant',
          content: msg.parts.map((part) => this.convertAssistantPart(part)),
        });
      } else if (msg.role === 'user') {
        result.push({
          role: 'user',
          content: msg.parts.map((part) => this.convertUserPart(part)),
        });
      } else if (msg.role === 'tool') {
        result.push({
          role: 'tool',
          content: msg.parts
            .filter((part): part is Extract<MessagePart, { type: 'tool-result' }> => part.type === 'tool-result')
            .map((part) => ({
              type: 'tool-result',
              toolCallId: part.callId,
              toolName: part.toolName,
              result: part.result,
              isError: part.isError,
            })),
        });
      }
    }

    return result;
  }

  fromProviderResponse(response: unknown, parentId: string | null): AdapterMessage {
    const res = response as AiSdkProviderResponse;

    const parts: MessagePart[] = [];

    if (res.text) {
      parts.push({ type: 'text', text: res.text });
    }

    if (res.toolCalls) {
      for (const tc of res.toolCalls) {
        parts.push({
          type: 'tool-call',
          callId: tc.toolCallId,
          toolName: tc.toolName,
          args: tc.args,
        });
      }
    }

    return {
      id: randomUUID(),
      parentId,
      role: 'assistant',
      parts,
      createdAt: new Date().toISOString(),
      meta: {
        usage: res.usage
          ? {
              inputTokens: res.usage.promptTokens,
              outputTokens: res.usage.completionTokens,
              totalTokens: res.usage.totalTokens,
            }
          : undefined,
      },
    };
  }

  convertToolChoice(toolChoice?: ToolChoice): 'auto' | 'none' | 'required' | { type: 'tool'; toolName: string } | undefined {
    if (!toolChoice) return undefined;
    if (typeof toolChoice === 'string') return toolChoice;
    return { type: 'tool', toolName: toolChoice.name };
  }

  convertTools(tools?: ToolSpec[]): Record<string, unknown> | undefined {
    if (!tools || tools.length === 0) return undefined;

    const result: Record<string, unknown> = {};
    for (const tool of tools) {
      result[tool.name] = {
        description: tool.description,
        parameters: jsonSchema(tool.inputSchema),
      };
    }
    return result;
  }

  private convertAssistantPart(part: MessagePart): unknown {
    switch (part.type) {
      case 'text':
        return { type: 'text', text: part.text };
      case 'tool-call':
        return {
          type: 'tool-call',
          toolCallId: part.callId,
          toolName: part.toolName,
          args: part.args,
        };
      default:
        return { type: 'text', text: '' };
    }
  }

  private convertUserPart(part: MessagePart): unknown {
    switch (part.type) {
      case 'text':
        return { type: 'text', text: part.text };
      case 'image':
        if (part.source.kind === 'base64') {
          return {
            type: 'image',
            image: part.source.data,
            mimeType: part.source.mediaType,
          };
        }
        return {
          type: 'image',
          image: new URL(part.source.url),
        };
      default:
        return { type: 'text', text: '' };
    }
  }
}
