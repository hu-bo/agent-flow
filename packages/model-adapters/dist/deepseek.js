import { createOpenAiAdapter } from './openai/index.js';
export const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';
export function createDeepSeekAdapter(options) {
    return createOpenAiAdapter({
        ...options,
        providerId: options.providerId ?? 'deepseek',
        compatibility: 'compatible',
        baseURL: options.baseURL ?? DEEPSEEK_BASE_URL,
    });
}
