import { createOpenAiAdapter } from './openai/index.js';
export const MINIMAX_BASE_URL = 'https://api.minimaxi.com/v1';
export function createMiniMaxAdapter(options) {
    return createOpenAiAdapter({
        ...options,
        providerId: options.providerId ?? 'minimax',
        compatibility: 'compatible',
        baseURL: options.baseURL ?? MINIMAX_BASE_URL,
    });
}
//# sourceMappingURL=minimax.js.map