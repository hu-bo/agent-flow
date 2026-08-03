import { type AnthropicProviderSettings } from '@ai-sdk/anthropic';
import { type AiSdkGenerationMode } from '../ai-sdk/adapter.js';
import type { ModelAdapter } from '../types/index.js';
export interface AnthropicAdapterOptions extends AnthropicProviderSettings {
    model: string;
    providerId?: string;
    generationMode?: AiSdkGenerationMode;
}
export declare function createAnthropicAdapter(options: AnthropicAdapterOptions): ModelAdapter;
