import type { KeyValueStore, VectorPoint, VectorQuery, VectorQueryResult, VectorStore } from './types.js';
export declare class InMemoryKeyValueStore implements KeyValueStore {
    private readonly store;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    delete(key: string): Promise<void>;
    increment(key: string, by?: number): Promise<number>;
}
export declare class InMemoryVectorStore implements VectorStore {
    private readonly points;
    upsert(points: VectorPoint[]): Promise<void>;
    search(query: VectorQuery): Promise<VectorQueryResult[]>;
    delete(ids: Array<string | number>): Promise<void>;
}
//# sourceMappingURL=in-memory.d.ts.map