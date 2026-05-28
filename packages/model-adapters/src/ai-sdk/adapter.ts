import type { LanguageModel } from 'ai';
import { generateText, streamText } from 'ai';
import type { AdapterMessage, GenerationRequest, GenerationResult, ModelAdapter, StreamEvent } from '../types/index.js';
import { AiSdkMessageTranslator } from './converter.js';

interface AiSdkProviderResponse {
  text?: string;
  toolCalls?: Array<{ toolCallId: string; toolName: string; args: unknown }>;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  finishReason?: string;
}

export type AiSdkGenerationMode = 'stream' | 'nonstream';

export interface AiSdkAdapterOptions {
  generationMode?: AiSdkGenerationMode;
}

export class AiSdkAdapter implements ModelAdapter {
  readonly provider: string;
  readonly translator: AiSdkMessageTranslator;
  private model: LanguageModel;
  private readonly generationMode: AiSdkGenerationMode;

  constructor(model: LanguageModel, provider: string, options: AiSdkAdapterOptions = {}) {
    this.model = model;
    this.provider = provider;
    this.translator = new AiSdkMessageTranslator();
    this.generationMode = options.generationMode ?? 'stream';
  }

  async generate(request: GenerationRequest): Promise<GenerationResult> {
    if (this.generationMode === 'nonstream') {
      return this.generateFromNonStreaming(request);
    }
    return this.generateFromStream(request);
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
          yield {
            type: 'error',
            message: event.error instanceof Error ? event.error.message : String(event.error),
            error: event.error,
          };
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
      case 'tool-call':
      case 'tool-calls':
        return 'tool-call';
      case 'content-filter':
        return 'content-filter';
      default:
        return 'error';
    }
  }

  private async generateFromStream(request: GenerationRequest): Promise<GenerationResult> {
    let text = '';
    let usage: GenerationResult['usage'] | undefined;
    let finishReason: GenerationResult['finishReason'] = 'error';
    const toolCalls = new Map<string, { toolCallId: string; toolName: string; args: unknown }>();

    for await (const event of this.stream(request)) {
      switch (event.type) {
        case 'text-delta':
          text += event.delta;
          break;
        case 'tool-call-start':
          toolCalls.set(event.callId, {
            toolCallId: event.callId,
            toolName: event.toolName,
            args: {},
          });
          break;
        case 'tool-call-end':
          toolCalls.set(event.callId, {
            toolCallId: event.callId,
            toolName: event.toolName,
            args: event.args,
          });
          break;
        case 'finish':
          finishReason = event.finishReason;
          usage = event.usage;
          break;
        case 'error':
          throw event.error instanceof Error ? event.error : new Error(event.message, { cause: event.error });
      }
    }

    return this.toGenerationResult(request, {
      text,
      toolCalls: Array.from(toolCalls.values()),
      usage: usage
        ? {
            promptTokens: usage.inputTokens,
            completionTokens: usage.outputTokens,
            totalTokens: usage.totalTokens,
          }
        : undefined,
      finishReason,
    });
  }

  private async generateFromNonStreaming(request: GenerationRequest): Promise<GenerationResult> {
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

    return this.toGenerationResult(request, {
      text: result.text,
      toolCalls: result.toolCalls,
      usage: result.usage,
      finishReason: result.finishReason,
    });
  }

  private toGenerationResult(request: GenerationRequest, response: AiSdkProviderResponse): GenerationResult {
    const lastMessage = request.messages[request.messages.length - 1];
    const parentId = lastMessage?.id ?? null;
    const message = this.translator.fromProviderResponse(response, parentId);

    message.meta = {
      ...(message.meta ?? {}),
      model: request.model,
      provider: this.provider,
    };

    const usage = response.usage
      ? {
          inputTokens: response.usage.promptTokens,
          outputTokens: response.usage.completionTokens,
          totalTokens: response.usage.totalTokens ?? response.usage.promptTokens + response.usage.completionTokens,
        }
      : {
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
        };

    const finishReason = this.mapFinishReason(response.finishReason ?? 'error');

    return {
      message,
      finishReason,
      usage,
      providerResponse: {
        finishReason: response.finishReason ?? 'error',
      },
    };
  }
}
