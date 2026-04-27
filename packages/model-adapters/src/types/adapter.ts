import type { AdapterMessage } from './message.js';
import type { GenerationRequest } from './request.js';
import type { GenerationResult, StreamEvent } from './response.js';

export interface MessageTranslator<TProviderMessage = unknown, TProviderResponse = unknown> {
  toProviderMessages(messages: AdapterMessage[]): TProviderMessage[];
  fromProviderResponse(response: TProviderResponse, parentId: string | null): AdapterMessage;
}

export interface ModelAdapter {
  readonly provider: string;
  readonly translator: MessageTranslator;
  generate(request: GenerationRequest): Promise<GenerationResult>;
  stream(request: GenerationRequest): AsyncIterable<StreamEvent>;
  estimateInputTokens(messages: AdapterMessage[]): Promise<number>;
}
