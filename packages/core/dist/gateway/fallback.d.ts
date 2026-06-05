import type { ProviderAdapter, ChatRequest, ChatResponse } from '../messages/index.js';
export interface FallbackChainConfig {
    chains: Record<string, string[]>;
    triggerOn: ('rate-limit' | 'server-error' | 'timeout' | 'model-unavailable')[];
    maxRetries: number;
}
export declare class FallbackChain {
    private config;
    private getAdapter;
    constructor(config: FallbackChainConfig, getAdapter: (modelId: string) => ProviderAdapter | undefined);
    execute(request: ChatRequest, primaryModelId: string): Promise<ChatResponse>;
    private shouldTriggerFallback;
    private backoff;
}
//# sourceMappingURL=fallback.d.ts.map