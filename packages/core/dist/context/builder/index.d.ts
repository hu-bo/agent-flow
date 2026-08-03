import type { AgentRunRequest, ContextBuilderLike, ContextEnvelope, ContextLoader, ContextSelector, TokenWindowManager } from '../../types/index.js';
export interface ContextBuilderOptions {
    maxTokens: number;
}
export declare class ContextBuilder implements ContextBuilderLike {
    private readonly loader;
    private readonly selector;
    private readonly windowManager;
    private readonly maxTokens;
    constructor(loader: ContextLoader, selector: ContextSelector, windowManager: TokenWindowManager, options: ContextBuilderOptions);
    build(request: AgentRunRequest): Promise<ContextEnvelope>;
}
