import type { VectorMemoryRecord, VectorSearchOptions, VectorSearchResult, VectorStore } from './types.js';
export declare class InMemoryVectorStore implements VectorStore {
    private readonly records;
    upsert(records: VectorMemoryRecord[]): Promise<void>;
    search(queryVector: number[], options?: VectorSearchOptions): Promise<VectorSearchResult[]>;
    delete(ids: string[]): Promise<void>;
}
export declare function cosineSimilarity(left: number[], right: number[]): number;
//# sourceMappingURL=vector-memory.d.ts.map