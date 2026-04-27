import type { LanguageModel } from 'ai';
import { generateText, streamText } from 'ai';
import type { AdapterMessage, GenerationRequest, GenerationResult, ModelAdapter, StreamEvent } from '../types/index.js';
import { AiSdkMessageTranslator } from './converter.js';

export class AiSdkAdapter implements ModelAdapter {
  readonly provider: string;
  readonly translator: AiSdkMessageTranslator;
  private model: LanguageModel;

  constructor(model: LanguageModel, provider: string) {
    this.model = model;
    this.provider = provider;
    this.translator = new AiSdkMessageTranslator();
  }

  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const messages = this.translator.toProviderMessages(request.messages) as Parameters<typeof generateText>[0]['messages'];

    const result = await generateText({
      model: this.model,
      messages,
      system: request.systemPrompt,
      tools: this.translator.convertTools(request.tools) as Parameters<typeof generateText>[0]['tools'],
      toolChoice: this.translator.convertToolChoice(request.toolChoice) as Parameters<typeof generateText>[0]['toolChoice'],
      maxTokens: request.config?.maxOutputTokens,
      temperature: request.config?.temperature,
      topP: request.config?.topP,
      abortSignal: request.signal,
    });

    const lastMessage = request.messages[request.messages.length - 1];
    const parentId = lastMessage?.id ?? null;
    const message = this.translator.fromProviderResponse(result, parentId);

    message.meta = {
      ...(message.meta ?? {}),
      model: this.model.modelId,
      provider: this.provider,
    };

    const finishReason = this.mapFinishReason(result.finishReason);

    return {
      message,
      finishReason,
      usage: {
        inputTokens: result.usage.promptTokens,
        outputTokens: result.usage.completionTokens,
        totalTokens: result.usage.promptTokens + result.usage.completionTokens,
      },
      providerResponse: {
        finishReason: result.finishReason,
      },
    };
  }

  async *stream(request: GenerationRequest): AsyncIterable<StreamEvent> {
    const messages = this.translator.toProviderMessages(request.messages) as Parameters<typeof streamText>[0]['messages'];

    const result = streamText({
      model: this.model,
      messages,
      system: request.systemPrompt,
      tools: this.translator.convertTools(request.tools) as Parameters<typeof streamText>[0]['tools'],
      toolChoice: this.translator.convertToolChoice(request.toolChoice) as Parameters<typeof streamText>[0]['toolChoice'],
      maxTokens: request.config?.maxOutputTokens,
      temperature: request.config?.temperature,
      topP: request.config?.topP,
      abortSignal: request.signal,
    });

    for await (const event of result.fullStream) {
      switch (event.type) {
        case 'text-delta':
          yield { type: 'text-delta', delta: event.textDelta };
          break;
        case 'tool-call-streaming-start':
          yield { type: 'tool-call-start', callId: event.toolCallId, toolName: event.toolName };
          break;
        case 'tool-call-delta':
          yield {
            type: 'tool-call-delta',
            callId: event.toolCallId,
            toolName: event.toolName,
            delta: event.argsTextDelta,
          };
          break;
        case 'tool-call':
          yield {
            type: 'tool-call-end',
            callId: event.toolCallId,
            toolName: event.toolName,
            args: event.args,
          };
          break;
        case 'finish':
          yield {
            type: 'finish',
            finishReason: this.mapFinishReason(event.finishReason),
            usage: {
              inputTokens: event.usage.promptTokens,
              outputTokens: event.usage.completionTokens,
              totalTokens: event.usage.promptTokens + event.usage.completionTokens,
            },
          };
          break;
        case 'error':
          yield { type: 'error', message: 'stream error' };
          break;
      }
    }
  }

  async estimateInputTokens(messages: AdapterMessage[]): Promise<number> {
    let charCount = 0;
    for (const msg of messages) {
      for (const part of msg.parts) {
        if (part.type === 'text') {
          charCount += part.text.length;
        } else if (part.type === 'reasoning') {
          charCount += part.text.length;
        }
      }
    }
    return Math.ceil(charCount / 4);
  }

  private mapFinishReason(reason: string): GenerationResult['finishReason'] {
    switch (reason) {
      case 'stop':
        return 'stop';
      case 'length':
        return 'length';
      case 'tool-calls':
        return 'tool-call';
      case 'content-filter':
        return 'content-filter';
      default:
        return 'error';
    }
  }
}
