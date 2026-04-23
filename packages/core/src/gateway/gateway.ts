import type { ProviderAdapter, ModelInfo, ChatRequest, ChatResponse } from '../messages/index.js';
import { ModelRouter } from './router.js';
import { FallbackChain } from './fallback.js';
import type { FallbackChainConfig } from './fallback.js';
import { RateLimiter } from './rate-limit.js';
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

export class ModelGateway {
  private adapters = new Map<string, ProviderAdapter>();
  private config: GatewayConfig;
  readonly router: ModelRouter;
  private fallbackChain?: FallbackChain;
  private rateLimiter?: RateLimiter;

  constructor(config: GatewayConfig) {
    this.config = config;
    this.router = new ModelRouter();

    if (config.fallback) {
      this.fallbackChain = new FallbackChain(
        config.fallback as FallbackChainConfig,
        (modelId) => this.adapters.get(modelId),
      );
    }

    if (config.rateLimit) {
      this.rateLimiter = new RateLimiter(config.rateLimit);
    }
  }

  resolveModel(): string {
    const chain = this.config.modelOverrides;
    return chain?.runtime ?? chain?.cli ?? chain?.env ?? chain?.config ?? this.config.defaultModel;
  }

  getAdapter(modelId?: string): ProviderAdapter {
    const id = modelId ?? this.resolveModel();
    const adapter = this.adapters.get(id);
    if (!adapter) throw new Error(`No adapter registered for model: ${id}`);
    return adapter;
  }

  switchModel(modelId: string): void {
    if (!this.config.modelOverrides) this.config.modelOverrides = {};
    this.config.modelOverrides.runtime = modelId;
  }

  registerAdapter(modelId: string, adapter: ProviderAdapter): void {
    this.adapters.set(modelId, adapter);
    this.router.registerAdapter(modelId, adapter);
  }

  registerModel(model: ModelInfo): void {
    this.router.registerModel(model);
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const modelId = this.resolveModel();

    if (this.rateLimiter) {
      await this.rateLimiter.acquire(modelId);
    }

    try {
      if (this.fallbackChain) {
        return await this.fallbackChain.execute(request, modelId);
      }
      return await this.getAdapter(modelId).chat(request);
    } finally {
      if (this.rateLimiter) {
        this.rateLimiter.release(modelId);
      }
    }
  }

  listModels(): ModelInfo[] {
    return this.router.listModels();
  }

  listRegisteredModels(): Array<{ modelId: string; provider: string }> {
    return Array.from(this.adapters.entries()).map(([modelId, adapter]) => ({
      modelId,
      provider: adapter.providerId,
    }));
  }
}


