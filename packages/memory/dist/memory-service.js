import { randomUUID } from 'node:crypto';
import { HashEmbeddingProvider } from './default-embedder.js';
import { InMemorySessionMemoryStore } from './session-memory.js';
import { InMemoryVectorStore } from './vector-memory.js';
class MinLengthWritePolicy {
    minLength;
    constructor(minLength) {
        this.minLength = minLength;
    }
    shouldWrite(record, _context) {
        return record.text.trim().length >= this.minLength;
    }
}
export class MemoryService {
    sessionStore;
    vectorStore;
    embedder;
    writePolicy;
    defaultNamespace;
    constructor(options = {}) {
        this.sessionStore = options.sessionStore ?? new InMemorySessionMemoryStore();
        this.vectorStore = options.vectorStore ?? new InMemoryVectorStore();
        this.embedder = options.embedder ?? new HashEmbeddingProvider();
        this.defaultNamespace = options.defaultNamespace ?? 'default';
        this.writePolicy = options.writePolicy ?? new MinLengthWritePolicy(options.minTextLengthForLongTerm ?? 24);
    }
    async rememberSession(sessionId, text, metadata = {}) {
        const record = {
            id: randomUUID(),
            sessionId,
            text,
            createdAt: new Date().toISOString(),
            metadata: { ...metadata },
        };
        await this.sessionStore.append(record);
        return record;
    }
    async rememberLongTerm(input) {
        const [vector] = await this.embedder.embed([input.text]);
        const record = {
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
    async ingestSessionToLongTerm(sessionId, namespace = this.defaultNamespace) {
        const sessionRecords = await this.sessionStore.list(sessionId);
        const result = [];
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
    async recall(query, options = {}) {
        const limit = options.limit ?? 5;
        const includeSessionMemory = options.includeSessionMemory ?? true;
        const allResults = [];
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
function lexicalScore(query, text) {
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
function tokenize(value) {
    return value
        .toLowerCase()
        .split(/[^\p{L}\p{N}_-]+/u)
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
}
function mapVectorResults(results) {
    return results.map((item) => ({
        source: 'vector',
        id: item.record.id,
        text: item.record.text,
        score: item.score,
        metadata: { ...item.record.metadata, namespace: item.record.namespace },
    }));
}
function deduplicateById(items) {
    const seen = new Set();
    const output = [];
    for (const item of items) {
        if (seen.has(item.id)) {
            continue;
        }
        seen.add(item.id);
        output.push(item);
    }
    return output;
}
