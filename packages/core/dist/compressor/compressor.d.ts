import type { UnifiedMessage, ProviderAdapter } from '../messages/index.js';
export interface CompactionResult {
    messages: UnifiedMessage[];
    stats: {
        originalMessageCount: number;
        originalTokenCount: number;
        compactedTokenCount: number;
        summarizedMessageCount: number;
    };
}
/** Context compression engine */
export declare class ContextCompressor {
    private adapter;
    constructor(adapter: ProviderAdapter);
    compact(messages: UnifiedMessage[], options?: {
        trigger?: 'auto' | 'manual' | 'model-switch';
        targetTokens?: number;
    }): Promise<CompactionResult>;
}
//# sourceMappingURL=compressor.d.ts.map