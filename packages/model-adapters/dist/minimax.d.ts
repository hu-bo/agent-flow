import { type OpenAiAdapterOptions } from './openai/index.js';
import type { ModelAdapter } from './types/index.js';
/** Creates an adapter for MiniMax's OpenAI-compatible Chat Completions API. */
export interface MiniMaxAdapterOptions extends OpenAiAdapterOptions {
}
export declare const MINIMAX_BASE_URL = "https://api.minimaxi.com/v1";
export declare function createMiniMaxAdapter(options: MiniMaxAdapterOptions): ModelAdapter;
