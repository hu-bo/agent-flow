import type { ProviderAdapter, ChatRequest, ChatResponse } from '@agent-flow/model-contracts';
import { RateLimitError, ModelError } from '@agent-flow/model-contracts';

export interface FallbackChainConfig {
  chains: Record<string, string[]>;
  triggerOn: ('rate-limit' | 'server-error' | 'timeout' | 'model-unavailable')[];
  maxRetries: number;
}

export class FallbackChain {
  constructor(
    private config: FallbackChainConfig,
    private getAdapter: (modelId: string) => ProviderAdapter | undefined,
  ) {}

  async execute(request: ChatRequest, primaryModelId: string): Promise<ChatResponse> {
    const chain = this.config.chains[primaryModelId] ?? [];
    const modelsToTry = [primaryModelId, ...chain];
    let lastError: unknown;

    for (const modelId of modelsToTry) {
      const adapter = this.getAdapter(modelId);
      if (!adapter) continue;

      for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
        try {
          return await adapter.chat(request);
        } catch (error) {
          lastError = error;
          if (!this.shouldTriggerFallback(error)) throw error;
          if (attempt < this.config.maxRetries - 1) {
            await this.backoff(attempt);
          }
        }
      }
    }

    throw lastError;
  }

  private shouldTriggerFallback(error: unknown): boolean {
    const triggers = this.config.triggerOn;

    if (error instanceof RateLimitError && triggers.includes('rate-limit')) return true;

    if (error instanceof ModelError) {
      if (triggers.includes('server-error') && error.code === 'SERVER_ERROR') return true;
      if (triggers.includes('timeout') && error.code === 'TIMEOUT') return true;
      if (triggers.includes('model-unavailable') && error.code === 'MODEL_UNAVAILABLE') return true;
    }

    return false;
  }

  private backoff(attempt: number): Promise<void> {
    const ms = Math.min(1000 * 2 ** attempt, 30000);
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
