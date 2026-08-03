import { type OpenAIProviderSettings } from '@ai-sdk/openai';
import { type AiSdkGenerationMode } from '../ai-sdk/adapter.js';
import type { ModelAdapter } from '../types/index.js';
export interface OpenAiAdapterOptions extends OpenAIProviderSettings {
    model: string;
    providerId?: string;
    generationMode?: AiSdkGenerationMode;
}
export declare function createOpenAiAdapter(options: OpenAiAdapterOptions): ModelAdapter;
