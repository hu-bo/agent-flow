import { createOpenAiAdapter, type OpenAiAdapterOptions } from './openai/index.js';
import type { ModelAdapter } from './types/index.js';

/** Creates an adapter for MiniMax's OpenAI-compatible Chat Completions API. */
export interface MiniMaxAdapterOptions extends OpenAiAdapterOptions {}

export const MINIMAX_BASE_URL = 'https://api.minimaxi.com/v1';

export function createMiniMaxAdapter(options: MiniMaxAdapterOptions): ModelAdapter {
  return createOpenAiAdapter({
    ...options,
    providerId: options.providerId ?? 'minimax',
    compatibility: 'compatible',
    baseURL: options.baseURL ?? MINIMAX_BASE_URL,
  });
}
