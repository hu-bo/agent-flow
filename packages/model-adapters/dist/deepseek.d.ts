import { type OpenAiAdapterOptions } from './openai/index.js';
import type { ModelAdapter } from './types/index.js';
/** Creates an adapter for DeepSeek's OpenAI-compatible Chat Completions API. */
export interface DeepSeekAdapterOptions extends OpenAiAdapterOptions {
}
export declare const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";
export declare function createDeepSeekAdapter(options: DeepSeekAdapterOptions): ModelAdapter;
