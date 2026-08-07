import { createOpenAiAdapter, type OpenAiAdapterOptions } from './openai/index.js';
import type { ModelAdapter } from './types/index.js';

/** Creates an adapter for DeepSeek's OpenAI-compatible Chat Completions API. */
export interface DeepSeekAdapterOptions extends OpenAiAdapterOptions {}

export const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';

export function createDeepSeekAdapter(options: DeepSeekAdapterOptions): ModelAdapter {
  return createOpenAiAdapter({
    ...options,
    providerId: options.providerId ?? 'deepseek',
    compatibility: 'compatible',
    baseURL: options.baseURL ?? DEEPSEEK_BASE_URL,
    textualToolCallFormat: 'dsml',
  });
}
