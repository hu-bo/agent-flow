import { randomUUID } from 'node:crypto';
import { HashEmbeddingProvider } from './default-embedder.js';
import { InMemorySessionMemoryStore } from './session-memory.js';
import type {
  EmbeddingProvider,
  MemoryMetadata,
  MemoryRecord,
  MemoryWriteDecisionContext,
  MemoryWritePolicy,
  RecallOptions,
  RecalledMemory,
  SessionMemoryRecord,
  SessionMemoryStore,
  VectorMemoryRecord,
  VectorSearchResult,
  VectorStore,
} from './types.js';
import { InMemoryVectorStore } from './vector-memory.js';

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

class MinLengthWritePolicy implements MemoryWritePolicy {
  constructor(private readonly minLength: number) {}

  shouldWrite(record: MemoryRecord, _context: MemoryWriteDecisionContext): boolean {
    return record.text.trim().length >= this.minLength;
  }
}

export class MemoryService {
  readonly sessionStore: SessionMemoryStore;
  readonly vectorStore: VectorStore;
  readonly embedder: EmbeddingProvider;
  readonly writePolicy: MemoryWritePolicy;
  readonly defaultNamespace: string;

  constructor(options: MemoryServiceOptions = {}) {
    this.sessionStore = options.sessionStore ?? new InMemorySessionMemoryStore();
    this.vectorStore = options.vectorStore ?? new InMemoryVectorStore();
    this.embedder = options.embedder ?? new HashEmbeddingProvider();
    this.defaultNamespace = options.defaultNamespace ?? 'default';
    this.writePolicy = options.writePolicy ?? new MinLengthWritePolicy(options.minTextLengthForLongTerm ?? 24);
  }

  async rememberSession(sessionId: string, text: string, metadata: MemoryMetadata = {}): Promise<SessionMemoryRecord> {
    const record: SessionMemoryRecord = {
      id: randomUUID(),
      sessionId,
      text,
      createdAt: new Date().toISOString(),
      metadata: { ...metadata },
    };

    await this.sessionStore.append(record);
    return record;
  }

  async rememberLongTerm(input: RememberLongTermInput): Promise<VectorMemoryRecord> {
    const [vector] = await this.embedder.embed([input.text]);
    const record: VectorMemoryRecord = {
      id: input.id ?? randomUUID(),
      text: input.text,
      createdAt: new Date().toISOString(),
      metadata: { ...(input.metadata ?? {}) },
      namespace: input.namespace ?? this.defaultNamespace,
      vector,
    };

    await this.vectorStore.upsert([record]);
    return record;
  }

  async ingestSessionToLongTerm(sessionId: string, namespace = this.defaultNamespace): Promise<VectorMemoryRecord[]> {
    const sessionRecords = await this.sessionStore.list(sessionId);
    const result: VectorMemoryRecord[] = [];

    for (const record of sessionRecords) {
      const shouldWrite = await this.writePolicy.shouldWrite(record, { sessionId, source: 'session' });
      if (!shouldWrite) {
        continue;
      }

      const longTerm = await this.rememberLongTerm({
        text: record.text,
        metadata: {
          ...record.metadata,
          sourceSessionId: sessionId,
          sourceRecordId: record.id,
        },
        namespace,
      });
      result.push(longTerm);
    }

    return result;
  }

  async recall(query: string, options: RecallOptions = {}): Promise<RecalledMemory[]> {
    const limit = options.limit ?? 5;
    const includeSessionMemory = options.includeSessionMemory ?? true;
    const allResults: RecalledMemory[] = [];

    if (includeSessionMemory && options.sessionId) {
      const sessionRecords = await this.sessionStore.list(options.sessionId);
      for (const record of sessionRecords) {
        const score = lexicalScore(query, record.text);
        if (score <= 0) {
          continue;
        }

        allResults.push({
          source: 'session',
          id: record.id,
          text: record.text,
          score,
          metadata: { ...record.metadata },
        });
      }
    }

    const [queryVector] = await this.embedder.embed([query]);
    const vectorResults = await this.vectorStore.search(queryVector, {
      namespace: options.namespace ?? this.defaultNamespace,
      limit,
      minScore: options.minScore,
    });

    allResults.push(...mapVectorResults(vectorResults));
    allResults.sort((a, b) => b.score - a.score);

    return deduplicateById(allResults).slice(0, limit);
  }
}

function lexicalScore(query: string, text: string): number {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return 0;
  }

  const textTokens = new Set(tokenize(text));
  let overlap = 0;
  for (const token of queryTokens) {
    if (textTokens.has(token)) {
      overlap += 1;
    }
  }

  return overlap / queryTokens.length;
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^\p{L}\p{N}_-]+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function mapVectorResults(results: VectorSearchResult[]): RecalledMemory[] {
  return results.map((item) => ({
    source: 'vector',
    id: item.record.id,
    text: item.record.text,
    score: item.score,
    metadata: { ...item.record.metadata, namespace: item.record.namespace },
  }));
}

function deduplicateById(items: RecalledMemory[]): RecalledMemory[] {
  const seen = new Set<string>();
  const output: RecalledMemory[] = [];
  for (const item of items) {
    if (seen.has(item.id)) {
      continue;
    }
    seen.add(item.id);
    output.push(item);
  }
  return output;
}
