import type {
  ProviderAdapter,
  ChatRequest,
  ChatResponse,
  StreamChunk,
  UnifiedMessage,
  MessageConverter,
  ContentPart,
  TextPart,
  ToolCallPart,
  ToolResultPart,
  TokenUsage,
} from '@agent-flow/model-contracts';
import { ModelError } from '@agent-flow/model-contracts';
import * as crypto from 'crypto';
import Anthropic from '@anthropic-ai/sdk';

class AnthropicMessageConverter implements MessageConverter {
  toProviderMessages(messages: UnifiedMessage[]): Anthropic.MessageParam[] {
    return messages
      .filter(m => m.role !== 'system')
      .map(m => this.convertMessage(m));
  }

  fromProviderResponse(response: unknown, parentUuid: string): UnifiedMessage {
    const msg = response as Anthropic.Message;
    const content: ContentPart[] = [];

    for (const block of msg.content) {
      if (block.type === 'text') {
        content.push({ type: 'text', text: block.text });
      } else if (block.type === 'tool_use') {
        content.push({
          type: 'tool-call',
          toolCallId: block.id,
          toolName: block.name,
          input: block.input as unknown,
        });
      }
    }

    const usage: TokenUsage = {
      promptTokens: msg.usage.input_tokens,
      completionTokens: msg.usage.output_tokens,
      totalTokens: msg.usage.input_tokens + msg.usage.output_tokens,
      cacheReadTokens: (msg.usage as unknown as Record<string, number>).cache_read_input_tokens,
      cacheWriteTokens: (msg.usage as unknown as Record<string, number>).cache_creation_input_tokens,
    };

    return {
      uuid: crypto.randomUUID(),
      parentUuid,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      metadata: { modelId: msg.model, provider: 'anthropic', tokenUsage: usage },
    };
  }

  private convertMessage(message: UnifiedMessage): Anthropic.MessageParam {
    if (message.role === 'assistant') {
      const blocks: Anthropic.ContentBlockParam[] = [];
      for (const part of message.content) {
        if (part.type === 'text') {
          blocks.push({ type: 'text', text: part.text });
        } else if (part.type === 'tool-call') {
          blocks.push({
            type: 'tool_use',
            id: part.toolCallId,
            name: part.toolName,
            input: part.input as Record<string, unknown>,
          });
        }
      }
      return { role: 'assistant', content: blocks };
    }

    if (message.role === 'tool') {
      const results: Anthropic.ToolResultBlockParam[] = [];
      for (const part of message.content) {
        if (part.type === 'tool-result') {
          results.push({
            type: 'tool_result',
            tool_use_id: part.toolCallId,
            content: typeof part.output === 'string' ? part.output : JSON.stringify(part.output),
            is_error: part.isError,
          });
        }
      }
      return { role: 'user', content: results };
    }

    // User message
    const blocks: Anthropic.ContentBlockParam[] = [];
    for (const part of message.content) {
      if (part.type === 'text') {
        blocks.push({ type: 'text', text: part.text });
      } else if (part.type === 'image') {
        if (part.source.type === 'base64') {
          blocks.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: part.source.mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: part.source.data,
            },
          });
        }
      }
    }
    return { role: 'user', content: blocks };
  }
}

/** Native Anthropic adapter with prompt caching support */
export class AnthropicAdapter implements ProviderAdapter {
  readonly providerId = 'anthropic';
  readonly converter: MessageConverter;
  private client: Anthropic;
  private modelId: string;
  private enableCaching: boolean;

  constructor(config: { apiKey?: string; modelId: string; enableCaching?: boolean }) {
    this.client = new Anthropic({
      apiKey: config.apiKey ?? process.env.ANTHROPIC_API_KEY,
    });
    this.modelId = config.modelId;
    this.enableCaching = config.enableCaching ?? false;
    this.converter = new AnthropicMessageConverter();
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const messages = this.converter.toProviderMessages(request.messages) as Anthropic.MessageParam[];

    const tools: Anthropic.Tool[] | undefined = request.tools?.map((t: { name: string; description: string; inputSchema: Record<string, unknown> }) => ({
      name: t.name,
      description: t.description,
      input_schema: t.inputSchema as Anthropic.Tool.InputSchema,
    }));

    const params: Anthropic.MessageCreateParams = {
      model: this.modelId,
      messages,
      max_tokens: request.maxTokens ?? 4096,
      temperature: request.temperature,
      stop_sequences: request.stopSequences,
      tools: tools && tools.length > 0 ? tools : undefined,
    };

    if (request.system) {
      if (this.enableCaching) {
        params.system = [{
          type: 'text',
          text: request.system,
          cache_control: { type: 'ephemeral' },
        }] as Anthropic.TextBlockParam[];
      } else {
        params.system = request.system;
      }
    }

    try {
      const response = await this.client.messages.create(params);
      const parentUuid = request.messages[request.messages.length - 1]?.uuid ?? '';
      const message = this.converter.fromProviderResponse(response, parentUuid);

      let finishReason: ChatResponse['finishReason'] = 'stop';
      if (response.stop_reason === 'tool_use') finishReason = 'tool-calls';
      else if (response.stop_reason === 'max_tokens') finishReason = 'length';

      return {
        message,
        finishReason,
        usage: message.metadata.tokenUsage ?? { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      };
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        throw new ModelError(error.message, `ANTHROPIC_${error.status}`, error.status === 429, 'anthropic', this.modelId);
      }
      throw error;
    }
  }

  async *streamChat(request: ChatRequest): AsyncIterable<StreamChunk> {
    const messages = this.converter.toProviderMessages(request.messages) as Anthropic.MessageParam[];

    const tools: Anthropic.Tool[] | undefined = request.tools?.map((t: { name: string; description: string; inputSchema: Record<string, unknown> }) => ({
      name: t.name,
      description: t.description,
      input_schema: t.inputSchema as Anthropic.Tool.InputSchema,
    }));

    const params: Anthropic.MessageCreateParams = {
      model: this.modelId,
      messages,
      max_tokens: request.maxTokens ?? 4096,
      temperature: request.temperature,
      tools: tools && tools.length > 0 ? tools : undefined,
      stream: true,
    };

    if (request.system) {
      params.system = request.system;
    }

    const stream = this.client.messages.stream(params);

    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        const delta = event.delta;
        if ('text' in delta) {
          yield { type: 'text-delta', textDelta: delta.text };
        } else if ('partial_json' in delta) {
          yield { type: 'tool-call-delta', inputDelta: delta.partial_json };
        }
      } else if (event.type === 'content_block_start') {
        if (event.content_block.type === 'tool_use') {
          yield {
            type: 'tool-call',
            toolCallId: event.content_block.id,
            toolName: event.content_block.name,
          };
        }
      } else if (event.type === 'message_delta') {
        let finishReason: ChatResponse['finishReason'] = 'stop';
        if (event.delta.stop_reason === 'tool_use') finishReason = 'tool-calls';
        else if (event.delta.stop_reason === 'max_tokens') finishReason = 'length';

        yield {
          type: 'finish',
          finishReason,
          usage: {
            promptTokens: 0,
            completionTokens: event.usage.output_tokens,
            totalTokens: event.usage.output_tokens,
          },
        };
      }
    }
  }

  async countTokens(messages: UnifiedMessage[]): Promise<number> {
    // Use Anthropic's token counting API if available, otherwise estimate
    let chars = 0;
    for (const msg of messages) {
      for (const part of msg.content) {
        if (part.type === 'text') chars += part.text.length;
        else if (part.type === 'tool-call') chars += JSON.stringify(part.input).length;
        else if (part.type === 'tool-result') chars += JSON.stringify(part.output).length;
      }
    }
    return Math.ceil(chars / 4);
  }
}
