import type { ProviderAdapter, ModelInfo, ChatRequest, ChatResponse } from '../messages/index.js';
import { ModelRouter } from './router.js';
import type { RateLimitConfig } from './rate-limit.js';
export interface ModelOverrideChain {
    runtime?: string;
    cli?: string;
    env?: string;
    config?: string;
}
export interface FallbackConfig {
    chains: Record<string, string[]>;
    triggerOn: ('rate-limit' | 'server-error' | 'timeout' | 'model-unavailable')[];
    maxRetries: number;
}
export interface GatewayConfig {
    defaultModel: string;
    modelOverrides?: ModelOverrideChain;
    fallback?: FallbackConfig;
    rateLimit?: RateLimitConfig;
}
export declare class ModelGateway {
    private adapters;
    private config;
    readonly router: ModelRouter;
    private fallbackChain?;
    private rateLimiter?;
    constructor(config: GatewayConfig);
    resolveModel(): string;
    getAdapter(modelId?: string): ProviderAdapter;
    switchModel(modelId: string): void;
    registerAdapter(modelId: string, adapter: ProviderAdapter): void;
    registerModel(model: ModelInfo): void;
    chat(request: ChatRequest): Promise<ChatResponse>;
    listModels(): ModelInfo[];
    listRegisteredModels(): Array<{
        modelId: string;
        provider: string;
    }>;
}
//# sourceMappingURL=gateway.d.ts.map