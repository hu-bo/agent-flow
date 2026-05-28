import { createAnthropic, type AnthropicProviderSettings } from '@ai-sdk/anthropic';
import { AiSdkAdapter, type AiSdkGenerationMode } from '../ai-sdk/adapter.js';
import type { ModelAdapter } from '../types/index.js';

export interface AnthropicAdapterOptions extends AnthropicProviderSettings {
  model: string;
  providerId?: string;
  generationMode?: AiSdkGenerationMode;
}

export function createAnthropicAdapter(options: AnthropicAdapterOptions): ModelAdapter {
  const { model, providerId, generationMode, ...providerOptions } = options;
  const provider = createAnthropic(providerOptions);
  return new AiSdkAdapter(provider(model), providerId ?? 'anthropic', {
    generationMode,
  });
}
