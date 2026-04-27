import { createAnthropic, type AnthropicProviderSettings } from '@ai-sdk/anthropic';
import { AiSdkAdapter } from '../ai-sdk/adapter.js';
import type { ModelAdapter } from '../types/index.js';

export interface AnthropicAdapterOptions extends AnthropicProviderSettings {
  model: string;
  providerId?: string;
}

export function createAnthropicAdapter(options: AnthropicAdapterOptions): ModelAdapter {
  const { model, providerId, ...providerOptions } = options;
  const provider = createAnthropic(providerOptions);
  return new AiSdkAdapter(provider(model), providerId ?? 'anthropic');
}
