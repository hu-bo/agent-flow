import { randomUUID } from 'node:crypto';
import type {
  AdapterMessage,
  AdapterTokenUsage,
  GenerationRequest,
  GenerationResult,
  MessagePart,
  MessageTranslator,
  ModelAdapter,
  StreamEvent,
} from '../types/index.js';
import { LocalMessageTranslator } from './converter.js';

export interface LocalAdapterOptions {
  providerId?: string;
  assistantName?: string;
}

export class LocalAdapter implements ModelAdapter {
  readonly provider: string;
  readonly translator: MessageTranslator;
  private readonly assistantName: string;

  constructor(options: LocalAdapterOptions = {}) {
    this.provider = options.providerId ?? 'local';
    this.assistantName = options.assistantName ?? 'LocalAgent';
    this.translator = new LocalMessageTranslator();
  }

  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const latestUserText = getLatestUserText(request.messages);
    const parentId = request.messages[request.messages.length - 1]?.id ?? null;

    const toolName = resolveToolCallName(request);
    if (toolName) {
      const toolCallId = randomUUID();
      const message = this.translator.fromProviderResponse(
        {
          toolCall: {
            id: toolCallId,
            name: toolName,
            input: { request: latestUserText },
          },
        },
        parentId,
      );
      message.meta = {
        ...(message.meta ?? {}),
        provider: this.provider,
        model: 'local-tool-first',
        usage: buildUsage(request.messages, ''),
      };

      return {
        message,
        finishReason: 'tool-call',
        usage: message.meta.usage!,
      };
    }

    const answer = `${this.assistantName}: 已接收请求。${latestUserText ? `你刚才说的是「${latestUserText}」。` : ''}这是本地适配器的可重复响应。`;
    const message = this.translator.fromProviderResponse({ text: answer }, parentId);
    message.meta = {
      ...(message.meta ?? {}),
      provider: this.provider,
      model: 'local-echo-v1',
      usage: buildUsage(request.messages, answer),
    };

    return {
      message,
      finishReason: 'stop',
      usage: message.meta.usage!,
    };
  }

  async *stream(request: GenerationRequest): AsyncIterable<StreamEvent> {
    const toolName = resolveToolCallName(request);
    if (toolName) {
      yield {
        type: 'tool-call-start',
        callId: randomUUID(),
        toolName,
      };
      yield {
        type: 'finish',
        finishReason: 'tool-call',
        usage: buildUsage(request.messages, ''),
      };
      return;
    }

    const latestUserText = getLatestUserText(request.messages);
    const answer = `${this.assistantName}: 已处理本地流式响应。${latestUserText ? `核心问题是「${latestUserText}」。` : ''}`;
    const chunks = answer.split(/(\s+)/g).filter((part) => part.length > 0);
    for (const chunk of chunks) {
      yield {
        type: 'text-delta',
        delta: chunk,
      };
    }

    yield {
      type: 'finish',
      finishReason: 'stop',
      usage: buildUsage(request.messages, answer),
    };
  }

  async estimateInputTokens(messages: AdapterMessage[]): Promise<number> {
    const content = messages
      .flatMap((message) => message.parts)
      .filter((part): part is Extract<MessagePart, { type: 'text' }> => part.type === 'text')
      .map((part) => part.text)
      .join('');

    return Math.ceil(content.length / 4);
  }
}

function resolveToolCallName(request: GenerationRequest): string | null {
  if (!request.tools || request.tools.length === 0) {
    return null;
  }

  if (typeof request.toolChoice === 'object' && request.toolChoice?.type === 'tool') {
    return request.toolChoice.name;
  }

  if (request.toolChoice === 'required') {
    return request.tools[0].name;
  }

  return null;
}

function getLatestUserText(messages: AdapterMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message.role !== 'user') {
      continue;
    }
    const text = message.parts
      .filter((part): part is Extract<MessagePart, { type: 'text' }> => part.type === 'text')
      .map((part) => part.text)
      .join(' ')
      .trim();
    if (text.length > 0) {
      return text;
    }
  }
  return '';
}

function buildUsage(messages: AdapterMessage[], answer: string): AdapterTokenUsage {
  const promptChars = messages.reduce((total, message) => {
    return (
      total +
      message.parts
        .filter((part): part is Extract<MessagePart, { type: 'text' }> => part.type === 'text')
        .reduce((sum, part) => sum + part.text.length, 0)
    );
  }, 0);
  const completionChars = answer.length;

  const inputTokens = Math.ceil(promptChars / 4);
  const outputTokens = Math.ceil(completionChars / 4);
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
  };
}
