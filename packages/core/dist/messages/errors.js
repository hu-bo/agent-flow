export class AgentFlowError extends Error {
    code;
    retryable;
    constructor(message, code, retryable = false) {
        super(message);
        this.code = code;
        this.retryable = retryable;
        this.name = 'AgentFlowError';
    }
}
export class ModelError extends AgentFlowError {
    provider;
    modelId;
    constructor(message, code, retryable = false, provider, modelId) {
        super(message, code, retryable);
        this.provider = provider;
        this.modelId = modelId;
        this.name = 'ModelError';
    }
}
export class RateLimitError extends ModelError {
    retryAfterMs;
    constructor(message, retryAfterMs, provider, modelId) {
        super(message, 'RATE_LIMIT', true, provider, modelId);
        this.retryAfterMs = retryAfterMs;
        this.name = 'RateLimitError';
    }
}
export class ContextTooLongError extends ModelError {
    currentTokens;
    maxTokens;
    constructor(message, currentTokens, maxTokens, provider, modelId) {
        super(message, 'CONTEXT_TOO_LONG', false, provider, modelId);
        this.currentTokens = currentTokens;
        this.maxTokens = maxTokens;
        this.name = 'ContextTooLongError';
    }
}
//# sourceMappingURL=errors.js.map