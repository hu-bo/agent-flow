export interface MemoryMetadata {
  [key: string]: unknown;
}

export interface MemoryRecord {
  id: string;
  text: string;
  createdAt: string;
  metadata: MemoryMetadata;
}

export interface SessionMemoryRecord extends MemoryRecord {
  sessionId: string;
}

export interface VectorMemoryRecord extends MemoryRecord {
  vector: number[];
  namespace: string;
}

export interface VectorSearchOptions {
  namespace?: string;
  limit?: number;
  minScore?: number;
}

export interface VectorSearchResult {
  record: VectorMemoryRecord;
  score: number;
}

export interface SessionMemoryStore {
  append(record: SessionMemoryRecord): Promise<void>;
  list(sessionId: string): Promise<SessionMemoryRecord[]>;
  clear(sessionId: string): Promise<void>;
}

export interface VectorStore {
  upsert(records: VectorMemoryRecord[]): Promise<void>;
  search(queryVector: number[], options?: VectorSearchOptions): Promise<VectorSearchResult[]>;
  delete(ids: string[]): Promise<void>;
}

export interface EmbeddingProvider {
  readonly modelId: string;
  readonly dimension: number;
  embed(texts: string[]): Promise<number[][]>;
}

export interface MemoryWriteDecisionContext {
  sessionId?: string;
  source: 'session' | 'manual' | 'tool';
}

export interface MemoryWritePolicy {
  shouldWrite(record: MemoryRecord, context: MemoryWriteDecisionContext): boolean | Promise<boolean>;
}

export interface RecallOptions {
  sessionId?: string;
  namespace?: string;
  limit?: number;
  includeSessionMemory?: boolean;
  minScore?: number;
}

export interface RecalledMemory {
  source: 'session' | 'vector';
  id: string;
  text: string;
  score: number;
  metadata: MemoryMetadata;
}
