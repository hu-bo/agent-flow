import type { CompactItem, CompactQualityEvaluator } from './types.js';
export declare class DefaultCompactQualityEvaluator implements CompactQualityEvaluator {
    evaluate(before: CompactItem[], after: CompactItem[], tokenLimit: number): number;
}
