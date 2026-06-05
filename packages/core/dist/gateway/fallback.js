import { RateLimitError, ModelError } from '../messages/index.js';
export class FallbackChain {
    config;
    getAdapter;
    constructor(config, getAdapter) {
        this.config = config;
        this.getAdapter = getAdapter;
    }
    async execute(request, primaryModelId) {
        const chain = this.config.chains[primaryModelId] ?? [];
        const modelsToTry = [primaryModelId, ...chain];
        let lastError;
        for (const modelId of modelsToTry) {
            const adapter = this.getAdapter(modelId);
            if (!adapter)
                continue;
            for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
                try {
                    return await adapter.chat(request);
                }
                catch (error) {
                    lastError = error;
                    if (!this.shouldTriggerFallback(error))
                        throw error;
                    if (attempt < this.config.maxRetries - 1) {
                        await this.backoff(attempt);
                    }
                }
            }
        }
        throw lastError;
    }
    shouldTriggerFallback(error) {
        const triggers = this.config.triggerOn;
        if (error instanceof RateLimitError && triggers.includes('rate-limit'))
            return true;
        if (error instanceof ModelError) {
            if (triggers.includes('server-error') && error.code === 'SERVER_ERROR')
                return true;
            if (triggers.includes('timeout') && error.code === 'TIMEOUT')
                return true;
            if (triggers.includes('model-unavailable') && error.code === 'MODEL_UNAVAILABLE')
                return true;
        }
        return false;
    }
    backoff(attempt) {
        const ms = Math.min(1000 * 2 ** attempt, 30000);
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
//# sourceMappingURL=fallback.js.map