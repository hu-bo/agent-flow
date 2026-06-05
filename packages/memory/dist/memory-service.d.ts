import type { EmbeddingProvider, MemoryMetadata, MemoryWritePolicy, RecallOptions, RecalledMemory, SessionMemoryRecord, SessionMemoryStore, VectorMemoryRecord, VectorStore } from './types.js';
export interface MemoryServiceOptions {
    sessionStore?: SessionMemoryStore;
    vectorStore?: VectorStore;
    embedder?: EmbeddingProvider;
    writePolicy?: MemoryWritePolicy;
    defaultNamespace?: string;
    minTextLengthForLongTerm?: number;
}
export interface RememberLongTermInput {
    text: string;
    metadata?: MemoryMetadata;
    namespace?: string;
    id?: string;
}
export declare class MemoryService {
    readonly sessionStore: SessionMemoryStore;
    readonly vectorStore: VectorStore;
    readonly embedder: EmbeddingProvider;
    readonly writePolicy: MemoryWritePolicy;
    readonly defaultNamespace: string;
    constructor(options?: MemoryServiceOptions);
    rememberSession(sessionId: string, text: string, metadata?: MemoryMetadata): Promise<SessionMemoryRecord>;
    rememberLongTerm(input: RememberLongTermInput): Promise<VectorMemoryRecord>;
    ingestSessionToLongTerm(sessionId: string, namespace?: string): Promise<VectorMemoryRecord[]>;
    recall(query: string, options?: RecallOptions): Promise<RecalledMemory[]>;
}
//# sourceMappingURL=memory-service.d.ts.map