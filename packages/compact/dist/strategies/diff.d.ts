import type { CompactRequest, CompactResult, CompactStrategy } from '../types.js';
export declare class DiffCompactStrategy implements CompactStrategy {
    readonly name: "diff";
    compact(request: CompactRequest): Promise<CompactResult>;
}
//# sourceMappingURL=diff.d.ts.map