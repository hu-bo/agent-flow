import { ModelRouter } from './router.js';
import { FallbackChain } from './fallback.js';
import { RateLimiter } from './rate-limit.js';
export class ModelGateway {
    adapters = new Map();
    config;
    router;
    fallbackChain;
    rateLimiter;
    constructor(config) {
        this.config = config;
        this.router = new ModelRouter();
        if (config.fallback) {
            this.fallbackChain = new FallbackChain(config.fallback, (modelId) => this.adapters.get(modelId));
        }
        if (config.rateLimit) {
            this.rateLimiter = new RateLimiter(config.rateLimit);
        }
    }
    resolveModel() {
        const chain = this.config.modelOverrides;
        return chain?.runtime ?? chain?.cli ?? chain?.env ?? chain?.config ?? this.config.defaultModel;
    }
    getAdapter(modelId) {
        const id = modelId ?? this.resolveModel();
        const adapter = this.adapters.get(id);
        if (!adapter)
            throw new Error(`No adapter registered for model: ${id}`);
        return adapter;
    }
    switchModel(modelId) {
        if (!this.config.modelOverrides)
            this.config.modelOverrides = {};
        this.config.modelOverrides.runtime = modelId;
    }
    registerAdapter(modelId, adapter) {
        this.adapters.set(modelId, adapter);
        this.router.registerAdapter(modelId, adapter);
    }
    registerModel(model) {
        this.router.registerModel(model);
    }
    async chat(request) {
        const modelId = this.resolveModel();
        if (this.rateLimiter) {
            await this.rateLimiter.acquire(modelId);
        }
        try {
            if (this.fallbackChain) {
                return await this.fallbackChain.execute(request, modelId);
            }
            return await this.getAdapter(modelId).chat(request);
        }
        finally {
            if (this.rateLimiter) {
                this.rateLimiter.release(modelId);
            }
        }
    }
    listModels() {
        return this.router.listModels();
    }
    listRegisteredModels() {
        return Array.from(this.adapters.entries()).map(([modelId, adapter]) => ({
            modelId,
            provider: adapter.providerId,
        }));
    }
}
//# sourceMappingURL=gateway.js.map