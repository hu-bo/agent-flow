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
import OpenAI from 'openai';

/**
 * DeepSeek adapter — uses OpenAI-compatible API.
 * DeepSeek's API is compatible with the OpenAI SDK, so we reuse it
 * with a custom baseURL.
 */

class DeepSeekMessageConverter implements MessageConverter {
  toProviderMessages(messages: UnifiedMessage[]): OpenAI.ChatCompletionMessageParam[] {
    return messages
      .filter(m => m.role !== 'system')
      .map(m => this.convertMessage(m));
  }

  fromProviderResponse(response: unknown, parentUuid: string): UnifiedMessage {
    const completion = response as OpenAI.ChatCompletion;
    const choice = completion.choices[0];
    const content: ContentPart[] = [];

    if (choice.message.content) {
      content.push({ type: 'text', text: choice.message.content });
    }

    if (choice.message.tool_calls) {
      for (const tc of choice.message.tool_calls) {
        content.push({
          type: 'tool-call',
          toolCallId: tc.id,
          toolName: tc.function.name,
          input: JSON.parse(tc.function.arguments || '{}'),
        });
      }
    }

    const usage: TokenUsage | undefined = completion.usage
      ? {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
        }
      : undefined;

    return {
      uuid: crypto.randomUUID(),
      parentUuid,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      metadata: { modelId: completion.model, provider: 'deepseek', tokenUsage: usage },
    };
  }

  private convertMessage(message: UnifiedMessage): OpenAI.ChatCompletionMessageParam {
    switch (message.role) {
      case 'user': {
        const text = message.content
          .filter((p: ContentPart): p is TextPart => p.type === 'text')
          .map((p: TextPart) => p.text)
          .join('\n');
        return { role: 'user', content: text };
      }

      case 'assistant': {
        const textParts = message.content.filter((p: ContentPart): p is TextPart => p.type === 'text');
        const toolCalls = message.content.filter((p: ContentPart): p is ToolCallPart => p.type === 'tool-call');
        const result: OpenAI.ChatCompletionAssistantMessageParam = {
          role: 'assistant',
          content: textParts.map((p: TextPart) => p.text).join('\n') || null,
        };
        if (toolCalls.length > 0) {
          result.tool_calls = toolCalls.map((tc: ToolCallPart) => ({
            id: tc.toolCallId,
            type: 'function' as const,
            function: { name: tc.toolName, arguments: JSON.stringify(tc.input) },
          }));
        }
        return result;
      }

      case 'tool': {
        const toolResult = message.content.find((p: ContentPart): p is ToolResultPart => p.type === 'tool-result');
        if (toolResult) {
          return {
            role: 'tool',
            tool_call_id: toolResult.toolCallId,
            content: typeof toolResult.output === 'string' ? toolResult.output : JSON.stringify(toolResult.output),
          };
        }
        return { role: 'user', content: '' };
      }

      default:
        return { role: 'user', content: '' };
    }
  }
}

export class DeepSeekAdapter implements ProviderAdapter {
  readonly providerId = 'deepseek';
  readonly converter: MessageConverter;
  private client: OpenAI;
  private modelId: string;

  constructor(config: { apiKey?: string; modelId?: string; baseURL?: string }) {
    this.client = new OpenAI({
      apiKey: config.apiKey ?? process.env.DEEPSEEK_API_KEY,
      baseURL: config.baseURL ?? 'https://api.deepseek.com',
    });
    this.modelId = config.modelId ?? 'deepseek-chat';
    this.converter = new DeepSeekMessageConverter();
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const messages = this.converter.toProviderMessages(request.messages) as OpenAI.ChatCompletionMessageParam[];

    const systemMessages: OpenAI.ChatCompletionMessageParam[] = request.system
      ? [{ role: 'system', content: request.system }]
      : [];

    const tools: OpenAI.ChatCompletionTool[] | undefined = request.tools?.map((t: { name: string; description: string; inputSchema: Record<string, unknown> }) => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.inputSchema as OpenAI.FunctionParameters,
      },
    }));

    try {
      const completion = await this.client.chat.completions.create({
        model: this.modelId,
        messages: [...systemMessages, ...messages],
        tools: tools && tools.length > 0 ? tools : undefined,
        max_tokens: request.maxTokens,
        temperature: request.temperature,
      });

      const parentUuid = request.messages[request.messages.length - 1]?.uuid ?? '';
      const message = this.converter.fromProviderResponse(completion, parentUuid);

      const choice = completion.choices[0];
      let finishReason: ChatResponse['finishReason'] = 'stop';
      if (choice.finish_reason === 'tool_calls') finishReason = 'tool-calls';
      else if (choice.finish_reason === 'length') finishReason = 'length';

      return {
        message,
        finishReason,
        usage: message.metadata.tokenUsage ?? { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      };
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new ModelError(error.message, `DEEPSEEK_${error.status}`, error.status === 429, 'deepseek', this.modelId);
      }
      throw error;
    }
  }

  async *streamChat(request: ChatRequest): AsyncIterable<StreamChunk> {
    const messages = this.converter.toProviderMessages(request.messages) as OpenAI.ChatCompletionMessageParam[];

    const systemMessages: OpenAI.ChatCompletionMessageParam[] = request.system
      ? [{ role: 'system', content: request.system }]
      : [];

    const tools: OpenAI.ChatCompletionTool[] | undefined = request.tools?.map((t: { name: string; description: string; inputSchema: Record<string, unknown> }) => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.inputSchema as OpenAI.FunctionParameters,
      },
    }));

    const stream = await this.client.chat.completions.create({
      model: this.modelId,
      messages: [...systemMessages, ...messages],
      tools: tools && tools.length > 0 ? tools : undefined,
      max_tokens: request.maxTokens,
      temperature: request.temperature,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (!delta) continue;

      if (delta.content) {
        yield { type: 'text-delta', textDelta: delta.content };
      }

      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          if (tc.function?.name) {
            yield { type: 'tool-call', toolCallId: tc.id ?? '', toolName: tc.function.name };
          }
          if (tc.function?.arguments) {
            yield { type: 'tool-call-delta', toolCallId: tc.id ?? '', inputDelta: tc.function.arguments };
          }
        }
      }

      if (chunk.choices[0]?.finish_reason) {
        let finishReason: ChatResponse['finishReason'] = 'stop';
        if (chunk.choices[0].finish_reason === 'tool_calls') finishReason = 'tool-calls';
        else if (chunk.choices[0].finish_reason === 'length') finishReason = 'length';
        yield { type: 'finish', finishReason };
      }
    }
  }

  async countTokens(messages: UnifiedMessage[]): Promise<number> {
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
