import type { EmbeddingProvider } from './types.js';
export declare class HashEmbeddingProvider implements EmbeddingProvider {
    readonly modelId = "hash-embedding-v1";
    readonly dimension: number;
    constructor(dimension?: number);
    embed(texts: string[]): Promise<number[][]>;
    private embedSingle;
}
//# sourceMappingURL=default-embedder.d.ts.map