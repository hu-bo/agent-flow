export class AdapterError extends Error {
  readonly code: string;
  readonly retryable: boolean;
  readonly provider?: string;
  readonly model?: string;

  constructor(message: string, code: string, retryable = false, provider?: string, model?: string) {
    super(message);
    this.name = 'AdapterError';
    this.code = code;
    this.retryable = retryable;
    this.provider = provider;
    this.model = model;
  }
}

export class RateLimitAdapterError extends AdapterError {
  readonly retryAfterMs?: number;

  constructor(message: string, provider?: string, model?: string, retryAfterMs?: number) {
    super(message, 'RATE_LIMIT', true, provider, model);
    this.name = 'RateLimitAdapterError';
    this.retryAfterMs = retryAfterMs;
  }
}

export class ContextWindowAdapterError extends AdapterError {
  readonly inputTokens: number;
  readonly limit: number;

  constructor(message: string, inputTokens: number, limit: number, provider?: string, model?: string) {
    super(message, 'CONTEXT_WINDOW_EXCEEDED', false, provider, model);
    this.name = 'ContextWindowAdapterError';
    this.inputTokens = inputTokens;
    this.limit = limit;
  }
}
