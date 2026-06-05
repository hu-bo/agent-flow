export class AdapterError extends Error {
    code;
    retryable;
    provider;
    model;
    constructor(message, code, retryable = false, provider, model) {
        super(message);
        this.name = 'AdapterError';
        this.code = code;
        this.retryable = retryable;
        this.provider = provider;
        this.model = model;
    }
}
export class RateLimitAdapterError extends AdapterError {
    retryAfterMs;
    constructor(message, provider, model, retryAfterMs) {
        super(message, 'RATE_LIMIT', true, provider, model);
        this.name = 'RateLimitAdapterError';
        this.retryAfterMs = retryAfterMs;
    }
}
export class ContextWindowAdapterError extends AdapterError {
    inputTokens;
    limit;
    constructor(message, inputTokens, limit, provider, model) {
        super(message, 'CONTEXT_WINDOW_EXCEEDED', false, provider, model);
        this.name = 'ContextWindowAdapterError';
        this.inputTokens = inputTokens;
        this.limit = limit;
    }
}
//# sourceMappingURL=errors.js.map