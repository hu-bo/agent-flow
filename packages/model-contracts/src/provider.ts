import type { UnifiedMessage, TokenUsage } from './message';
import type { ToolDefinition } from './tool';

export interface ChatRequest {
  messages: UnifiedMessage[];
  system?: string;
  tools?: ToolDefinition[];
  toolChoice?: 'auto' | 'none' | 'required' | { type: 'tool'; toolName: string };
  maxTokens?: number;
  temperature?: number;
  stopSequences?: string[];
  abortSignal?: AbortSignal;
}

export interface ChatResponse {
  message: UnifiedMessage;
  finishReason: 'stop' | 'length' | 'tool-calls' | 'error';
  usage: TokenUsage;
}

export interface StreamChunk {
  type: 'text-delta' | 'tool-call-delta' | 'tool-call' | 'finish' | 'error';
  textDelta?: string;
  toolCallId?: string;
  toolName?: string;
  inputDelta?: string;
  finishReason?: ChatResponse['finishReason'];
  usage?: TokenUsage;
}

export interface MessageConverter {
  toProviderMessages(messages: UnifiedMessage[]): unknown[];
  fromProviderResponse(response: unknown, parentUuid: string): UnifiedMessage;
}

export interface ProviderAdapter {
  readonly providerId: string;
  readonly converter: MessageConverter;

  chat(request: ChatRequest): Promise<ChatResponse>;
  streamChat(request: ChatRequest): AsyncIterable<StreamChunk>;
  countTokens(messages: UnifiedMessage[]): Promise<number>;
}
