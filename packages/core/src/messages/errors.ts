export class AgentFlowError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'AgentFlowError';
  }
}

export class ModelError extends AgentFlowError {
  constructor(
    message: string,
    code: string,
    retryable = false,
    public readonly provider?: string,
    public readonly modelId?: string
  ) {
    super(message, code, retryable);
    this.name = 'ModelError';
  }
}

export class RateLimitError extends ModelError {
  constructor(message: string, public readonly retryAfterMs?: number, provider?: string, modelId?: string) {
    super(message, 'RATE_LIMIT', true, provider, modelId);
    this.name = 'RateLimitError';
  }
}

export class ContextTooLongError extends ModelError {
  constructor(
    message: string,
    public readonly currentTokens: number,
    public readonly maxTokens: number,
    provider?: string,
    modelId?: string
  ) {
    super(message, 'CONTEXT_TOO_LONG', false, provider, modelId);
    this.name = 'ContextTooLongError';
  }
}
