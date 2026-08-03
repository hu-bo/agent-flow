import type { AgentRunRequest, ContextFragment, ContextSelector } from '../../types/index.js';
export declare class KeywordContextSelector implements ContextSelector {
    private readonly maxFragments;
    constructor(maxFragments?: number);
    select(fragments: ContextFragment[], request: AgentRunRequest): Promise<ContextFragment[]>;
}
