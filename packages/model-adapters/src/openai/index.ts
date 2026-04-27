import { createOpenAI, type OpenAIProviderSettings } from '@ai-sdk/openai';
import { AiSdkAdapter } from '../ai-sdk/adapter.js';
import type { ModelAdapter } from '../types/index.js';

export interface OpenAiAdapterOptions extends OpenAIProviderSettings {
  model: string;
  providerId?: string;
}

export function createOpenAiAdapter(options: OpenAiAdapterOptions): ModelAdapter {
  const { model, providerId, ...providerOptions } = options;
  const provider = createOpenAI(providerOptions);
  return new AiSdkAdapter(provider(model), providerId ?? providerOptions.name ?? 'openai');
}
