import type {
  UnifiedMessage,
  MessageConverter,
  ContentPart,
  ToolDefinition,
} from '@agent-flow/core/messages';
import { jsonSchema } from 'ai';

export class AiSdkMessageConverter implements MessageConverter {
  toProviderMessages(messages: UnifiedMessage[]): unknown[] {
    const result: unknown[] = [];

    for (const msg of messages) {
      if (msg.role === 'system') continue;

      if (msg.role === 'assistant') {
        result.push({
          role: 'assistant',
          content: msg.content.map((part) => this.convertAssistantPart(part)),
        });
      } else if (msg.role === 'user') {
        result.push({
          role: 'user',
          content: msg.content.map((part) => this.convertUserPart(part)),
        });
      } else if (msg.role === 'tool') {
        result.push({
          role: 'tool',
          content: msg.content
            .filter((part): part is Extract<ContentPart, { type: 'tool-result' }> => part.type === 'tool-result')
            .map((part) => ({
              type: 'tool-result',
              toolCallId: part.toolCallId,
              toolName: part.toolName,
              result: part.output,
              isError: part.isError,
            })),
        });
      }
    }

    return result;
  }

  fromProviderResponse(response: unknown, parentUuid: string): UnifiedMessage {
    const res = response as {
      text?: string;
      toolCalls?: Array<{ toolCallId: string; toolName: string; args: unknown }>;
      usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
    };

    const content: ContentPart[] = [];

    if (res.text) {
      content.push({ type: 'text', text: res.text });
    }

    if (res.toolCalls) {
      for (const tc of res.toolCalls) {
        content.push({
          type: 'tool-call',
          toolCallId: tc.toolCallId,
          toolName: tc.toolName,
          input: tc.args,
        });
      }
    }

    return {
      uuid: crypto.randomUUID(),
      parentUuid,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      metadata: {
        tokenUsage: res.usage
          ? {
              promptTokens: res.usage.promptTokens,
              completionTokens: res.usage.completionTokens,
              totalTokens: res.usage.totalTokens,
            }
          : undefined,
      },
    };
  }

  convertToolChoice(
    toolChoice?: 'auto' | 'none' | 'required' | { type: 'tool'; toolName: string },
  ): 'auto' | 'none' | 'required' | { type: 'tool'; toolName: string } | undefined {
    if (!toolChoice) return undefined;
    if (typeof toolChoice === 'string') return toolChoice;
    return { type: 'tool', toolName: toolChoice.toolName };
  }

  convertTools(tools?: ToolDefinition[]): Record<string, unknown> | undefined {
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

  private convertAssistantPart(part: ContentPart): unknown {
    switch (part.type) {
      case 'text':
        return { type: 'text', text: part.text };
      case 'tool-call':
        return {
          type: 'tool-call',
          toolCallId: part.toolCallId,
          toolName: part.toolName,
          args: part.input,
        };
      default:
        return { type: 'text', text: '' };
    }
  }

  private convertUserPart(part: ContentPart): unknown {
    switch (part.type) {
      case 'text':
        return { type: 'text', text: part.text };
      case 'image':
        if (part.source.type === 'base64') {
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

