import type { KeyValueStore, VectorPoint, VectorQuery, VectorQueryResult, VectorStore } from './types.js';

export class InMemoryKeyValueStore implements KeyValueStore {
  private readonly store = new Map<string, { value: string; expiresAt?: number }>();

  async get(key: string): Promise<string | null> {
    const hit = this.store.get(key);
    if (!hit) {
      return null;
    }

    if (hit.expiresAt !== undefined && hit.expiresAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }

    return hit.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds !== undefined ? Date.now() + ttlSeconds * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async increment(key: string, by = 1): Promise<number> {
    const currentRaw = await this.get(key);
    const current = currentRaw === null ? 0 : Number(currentRaw);
    if (Number.isNaN(current)) {
      throw new Error(`Value at key "${key}" is not numeric.`);
    }
    const next = current + by;
    await this.set(key, String(next));
    return next;
  }
}

export class InMemoryVectorStore implements VectorStore {
  private readonly points = new Map<string | number, VectorPoint>();

  async upsert(points: VectorPoint[]): Promise<void> {
    for (const point of points) {
      this.points.set(point.id, {
        ...point,
        vector: [...point.vector],
        payload: point.payload ? { ...point.payload } : undefined,
      });
    }
  }

  async search(query: VectorQuery): Promise<VectorQueryResult[]> {
    const limit = query.limit ?? 5;
    const result: VectorQueryResult[] = [];

    for (const point of this.points.values()) {
      const score = cosineSimilarity(query.vector, point.vector);
      result.push({
        id: point.id,
        score,
        payload: point.payload ? { ...point.payload } : undefined,
      });
    }

    result.sort((a, b) => b.score - a.score);
    return result.slice(0, limit);
  }

  async delete(ids: Array<string | number>): Promise<void> {
    for (const id of ids) {
      this.points.delete(id);
    }
  }
}

function cosineSimilarity(left: number[], right: number[]): number {
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
