import type { VectorMemoryRecord, VectorSearchOptions, VectorSearchResult, VectorStore } from './types.js';

export class InMemoryVectorStore implements VectorStore {
  private readonly records = new Map<string, VectorMemoryRecord>();

  async upsert(records: VectorMemoryRecord[]): Promise<void> {
    for (const record of records) {
      this.records.set(record.id, {
        ...record,
        vector: [...record.vector],
        metadata: { ...record.metadata },
      });
    }
  }

  async search(queryVector: number[], options: VectorSearchOptions = {}): Promise<VectorSearchResult[]> {
    const limit = options.limit ?? 5;
    const minScore = options.minScore ?? Number.NEGATIVE_INFINITY;
    const namespace = options.namespace;

    const result: VectorSearchResult[] = [];
    for (const record of this.records.values()) {
      if (namespace && record.namespace !== namespace) {
        continue;
      }

      const score = cosineSimilarity(queryVector, record.vector);
      if (score >= minScore) {
        result.push({
          record: {
            ...record,
            vector: [...record.vector],
            metadata: { ...record.metadata },
          },
          score,
        });
      }
    }

    result.sort((a, b) => b.score - a.score);
    return result.slice(0, limit);
  }

  async delete(ids: string[]): Promise<void> {
    for (const id of ids) {
      this.records.delete(id);
    }
  }
}

export function cosineSimilarity(left: number[], right: number[]): number {
  const size = Math.min(left.length, right.length);
  if (size === 0) {
    return 0;
  }

  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let i = 0; i < size; i += 1) {
    const l = left[i] ?? 0;
    const r = right[i] ?? 0;
    dot += l * r;
    leftNorm += l * l;
    rightNorm += r * r;
  }

  if (leftNorm === 0 || rightNorm === 0) {
    return 0;
  }

  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}
