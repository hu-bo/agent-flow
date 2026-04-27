import type { AgentRunRequest, ContextBuilderLike, ContextEnvelope, ContextLoader, ContextSelector, TokenWindowManager } from '../../types/index.js';

export interface ContextBuilderOptions {
  maxTokens: number;
}

export class ContextBuilder implements ContextBuilderLike {
  private readonly maxTokens: number;

  constructor(
    private readonly loader: ContextLoader,
    private readonly selector: ContextSelector,
    private readonly windowManager: TokenWindowManager,
    options: ContextBuilderOptions
  ) {
    this.maxTokens = options.maxTokens;
  }

  async build(request: AgentRunRequest): Promise<ContextEnvelope> {
    const loaded = await this.loader.load(request);
    const selected = await this.selector.select(loaded, request);
    return this.windowManager.apply(selected, this.maxTokens);
  }
}
