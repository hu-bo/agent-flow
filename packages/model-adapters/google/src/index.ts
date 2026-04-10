import type {
  ProviderAdapter,
  ChatRequest,
  ChatResponse,
  StreamChunk,
  UnifiedMessage,
  MessageConverter,
  ContentPart,
  TokenUsage,
  ToolDefinition,
} from '@agent-flow/model-contracts';
import { ModelError } from '@agent-flow/model-contracts';
import * as crypto from 'crypto';
import { GoogleGenerativeAI, type Content, type Part, type GenerateContentResult, type FunctionDeclarationSchema, SchemaType } from '@google/generative-ai';

class GeminiMessageConverter implements MessageConverter {
  toProviderMessages(messages: UnifiedMessage[]): Content[] {
    return messages
      .filter(m => m.role !== 'system')
      .map(m => this.convertMessage(m));
  }

  fromProviderResponse(response: unknown, parentUuid: string): UnifiedMessage {
    const result = response as GenerateContentResult;
    const candidate = result.response.candidates?.[0];
    const content: ContentPart[] = [];

    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if ('text' in part && part.text) {
          content.push({ type: 'text', text: part.text });
        } else if ('functionCall' in part && part.functionCall) {
          content.push({
            type: 'tool-call',
            toolCallId: crypto.randomUUID(),
            toolName: part.functionCall.name,
            input: part.functionCall.args ?? {},
          });
        }
      }
    }

    const usageMeta = result.response.usageMetadata;
    const usage: TokenUsage = {
      promptTokens: usageMeta?.promptTokenCount ?? 0,
      completionTokens: usageMeta?.candidatesTokenCount ?? 0,
      totalTokens: usageMeta?.totalTokenCount ?? 0,
    };

    return {
      uuid: crypto.randomUUID(),
      parentUuid,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      metadata: { provider: 'google', tokenUsage: usage },
    };
  }

  private convertMessage(message: UnifiedMessage): Content {
    const parts: Part[] = [];

    for (const part of message.content) {
      if (part.type === 'text') {
        parts.push({ text: part.text });
      } else if (part.type === 'image' && part.source.type === 'base64') {
        parts.push({
          inlineData: {
            mimeType: part.source.mediaType,
            data: part.source.data,
          },
        });
      } else if (part.type === 'tool-call') {
        parts.push({
          functionCall: {
            name: part.toolName,
            args: part.input as Record<string, unknown>,
          },
        });
      } else if (part.type === 'tool-result') {
        parts.push({
          functionResponse: {
            name: part.toolName,
            response: { result: part.output },
          },
        });
      }
    }

    const role = message.role === 'assistant' ? 'model' : 'user';
    return { role, parts };
  }
}

/** Google Gemini adapter */
export class GoogleAdapter implements ProviderAdapter {
  readonly providerId = 'google';
  readonly converter: MessageConverter;
  private genAI: GoogleGenerativeAI;
  private modelId: string;

  constructor(config: { apiKey?: string; modelId: string }) {
    const apiKey = config.apiKey ?? process.env.GOOGLE_API_KEY ?? '';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelId = config.modelId;
    this.converter = new GeminiMessageConverter();
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const tools = request.tools ? this.convertTools(request.tools) : undefined;
    const model = this.genAI.getGenerativeModel({
      model: this.modelId,
      systemInstruction: request.system,
      tools: tools ? [{ functionDeclarations: tools }] : undefined,
    });

    const contents = this.converter.toProviderMessages(request.messages) as Content[];

    try {
      const result = await model.generateContent({
        contents,
        generationConfig: {
          maxOutputTokens: request.maxTokens,
          temperature: request.temperature,
        },
      });

      const parentUuid = request.messages[request.messages.length - 1]?.uuid ?? '';
      const message = this.converter.fromProviderResponse(result, parentUuid);

      const candidate = result.response.candidates?.[0];
      let finishReason: ChatResponse['finishReason'] = 'stop';
      if (candidate?.finishReason === 'MAX_TOKENS') finishReason = 'length';
      // Check if response contains function calls
      const hasToolCalls = message.content.some(p => p.type === 'tool-call');
      if (hasToolCalls) finishReason = 'tool-calls';

      return {
        message,
        finishReason,
        usage: message.metadata.tokenUsage ?? { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      };
    } catch (error) {
      throw new ModelError(
        (error as Error).message,
        'GOOGLE_ERROR',
        false,
        'google',
        this.modelId,
      );
    }
  }

  async *streamChat(request: ChatRequest): AsyncIterable<StreamChunk> {
    const tools = request.tools ? this.convertTools(request.tools) : undefined;
    const model = this.genAI.getGenerativeModel({
      model: this.modelId,
      systemInstruction: request.system,
      tools: tools ? [{ functionDeclarations: tools }] : undefined,
    });

    const contents = this.converter.toProviderMessages(request.messages) as Content[];

    const result = await model.generateContentStream({
      contents,
      generationConfig: {
        maxOutputTokens: request.maxTokens,
        temperature: request.temperature,
      },
    });

    for await (const chunk of result.stream) {
      const candidate = chunk.candidates?.[0];
      if (!candidate?.content?.parts) continue;

      for (const part of candidate.content.parts) {
        if ('text' in part && part.text) {
          yield { type: 'text-delta', textDelta: part.text };
        } else if ('functionCall' in part && part.functionCall) {
          yield {
            type: 'tool-call',
            toolCallId: crypto.randomUUID(),
            toolName: part.functionCall.name,
          };
        }
      }
    }

    yield { type: 'finish', finishReason: 'stop' };
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

  private convertTools(tools: ToolDefinition[]) {
    return tools.map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.inputSchema as unknown as FunctionDeclarationSchema,
    }));
  }
}
