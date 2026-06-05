import type { CompactRequest, CompactResult, CompactStrategy } from '../types.js';
export declare class SemanticCompactStrategy implements CompactStrategy {
    readonly name: "semantic";
    compact(request: CompactRequest): Promise<CompactResult>;
}
//# sourceMappingURL=semantic.d.ts.map