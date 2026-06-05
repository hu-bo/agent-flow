import type { CompactRequest, CompactResult, CompactStrategy } from '../types.js';
export declare class RewriteCompactStrategy implements CompactStrategy {
    readonly name: "rewrite";
    compact(request: CompactRequest): Promise<CompactResult>;
}
//# sourceMappingURL=rewrite.d.ts.map