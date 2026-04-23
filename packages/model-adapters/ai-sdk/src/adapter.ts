import type {
  ProviderAdapter,
  ChatRequest,
  ChatResponse,
  StreamChunk,
  UnifiedMessage,
} from '@agent-flow/core/messages';
import type { LanguageModel } from 'ai';
import { generateText, streamText } from 'ai';
import { AiSdkMessageConverter } from './converter.js';

export class AiSdkAdapter implements ProviderAdapter {
  readonly providerId: string;
  readonly converter: AiSdkMessageConverter;
  private model: LanguageModel;

  constructor(model: LanguageModel, providerId: string) {
    this.model = model;
    this.providerId = providerId;
    this.converter = new AiSdkMessageConverter();
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const messages = this.converter.toProviderMessages(request.messages) as Parameters<typeof generateText>[0]['messages'];

    const result = await generateText({
      model: this.model,
      messages,
      system: request.system,
      tools: this.converter.convertTools(request.tools) as Parameters<typeof generateText>[0]['tools'],
      toolChoice: this.converter.convertToolChoice(request.toolChoice) as Parameters<typeof generateText>[0]['toolChoice'],
      maxTokens: request.maxTokens,
      temperature: request.temperature,
      abortSignal: request.abortSignal,
    });

    const lastMessage = request.messages[request.messages.length - 1];
    const parentUuid = lastMessage?.uuid ?? null;
    const message = this.converter.fromProviderResponse(result, parentUuid!);

    message.metadata.modelId = this.model.modelId;
    message.metadata.provider = this.providerId;

    const finishReason = this.mapFinishReason(result.finishReason);

    return {
      message,
      finishReason,
      usage: {
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.promptTokens + result.usage.completionTokens,
      },
    };
  }

  async *streamChat(request: ChatRequest): AsyncIterable<StreamChunk> {
    const messages = this.converter.toProviderMessages(request.messages) as Parameters<typeof streamText>[0]['messages'];

    const result = streamText({
      model: this.model,
      messages,
      system: request.system,
      tools: this.converter.convertTools(request.tools) as Parameters<typeof streamText>[0]['tools'],
      toolChoice: this.converter.convertToolChoice(request.toolChoice) as Parameters<typeof streamText>[0]['toolChoice'],
      maxTokens: request.maxTokens,
      temperature: request.temperature,
      abortSignal: request.abortSignal,
    });

    for await (const event of result.fullStream) {
      switch (event.type) {
        case 'text-delta':
          yield { type: 'text-delta', textDelta: event.textDelta };
          break;
        case 'tool-call':
          yield {
            type: 'tool-call',
            toolCallId: event.toolCallId,
            toolName: event.toolName,
          };
          break;
        case 'tool-call-streaming-start':
          yield {
            type: 'tool-call-delta',
            toolCallId: event.toolCallId,
            toolName: event.toolName,
            inputDelta: '',
          };
          break;
        case 'tool-call-delta':
          yield {
            type: 'tool-call-delta',
            toolCallId: event.toolCallId,
            toolName: event.toolName,
            inputDelta: event.argsTextDelta,
          };
          break;
        case 'finish':
          yield {
            type: 'finish',
            finishReason: this.mapFinishReason(event.finishReason),
            usage: {
              promptTokens: event.usage.promptTokens,
              completionTokens: event.usage.completionTokens,
              totalTokens: event.usage.promptTokens + event.usage.completionTokens,
            },
          };
          break;
        case 'error':
          yield { type: 'error' };
          break;
      }
    }
  }

  async countTokens(messages: UnifiedMessage[]): Promise<number> {
    let charCount = 0;
    for (const msg of messages) {
      for (const part of msg.content) {
        if (part.type === 'text') {
          charCount += part.text.length;
        }
      }
    }
    return Math.ceil(charCount / 4);
  }

  private mapFinishReason(reason: string): ChatResponse['finishReason'] {
    switch (reason) {
      case 'stop':
        return 'stop';
      case 'length':
        return 'length';
      case 'tool-calls':
        return 'tool-calls';
      default:
        return 'error';
    }
  }
}


