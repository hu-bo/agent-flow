import type { VectorPoint, VectorQuery, VectorQueryResult, VectorStore } from './types.js';
export interface QdrantStorageAdapterOptions {
    baseUrl: string;
    collection: string;
    apiKey?: string;
}
export declare class QdrantStorageAdapter implements VectorStore {
    private readonly baseUrl;
    private readonly collection;
    private readonly apiKey?;
    constructor(options: QdrantStorageAdapterOptions);
    upsert(points: VectorPoint[]): Promise<void>;
    search(query: VectorQuery): Promise<VectorQueryResult[]>;
    delete(ids: Array<string | number>): Promise<void>;
    private request;
}
//# sourceMappingURL=qdrant-adapter.d.ts.map