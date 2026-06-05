import type { CompactQualityEvaluator, CompactRequest, CompactResult, CompactStrategy } from './types.js';
export interface AutoCompactorOptions {
    strategies?: CompactStrategy[];
    evaluator?: CompactQualityEvaluator;
    minQualityScore?: number;
}
export declare class AutoCompactor {
    private readonly strategies;
    private readonly evaluator;
    private readonly minQualityScore;
    constructor(options?: AutoCompactorOptions);
    compact(request: CompactRequest): Promise<CompactResult>;
}
//# sourceMappingURL=auto-compact.d.ts.map