import type { VectorPoint, VectorQuery, VectorQueryResult, VectorStore } from './types.js';

export interface QdrantStorageAdapterOptions {
  baseUrl: string;
  collection: string;
  apiKey?: string;
}

export class QdrantStorageAdapter implements VectorStore {
  private readonly baseUrl: string;
  private readonly collection: string;
  private readonly apiKey?: string;

  constructor(options: QdrantStorageAdapterOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/g, '');
    this.collection = options.collection;
    this.apiKey = options.apiKey;
  }

  async upsert(points: VectorPoint[]): Promise<void> {
    await this.request(`/collections/${this.collection}/points?wait=true`, {
      method: 'PUT',
      body: {
        points,
      },
    });
  }

  async search(query: VectorQuery): Promise<VectorQueryResult[]> {
    const payload = await this.request(`/collections/${this.collection}/points/search`, {
      method: 'POST',
      body: {
        vector: query.vector,
        limit: query.limit ?? 5,
        filter: query.filter,
        with_payload: true,
      },
    });

    const result = (payload.result ?? []) as Array<{
      id: string | number;
      score: number;
      payload?: Record<string, unknown>;
    }>;

    return result.map((item) => ({
      id: item.id,
      score: item.score,
      payload: item.payload,
    }));
  }

  async delete(ids: Array<string | number>): Promise<void> {
    await this.request(`/collections/${this.collection}/points/delete?wait=true`, {
      method: 'POST',
      body: {
        points: ids,
      },
    });
  }

  private async request(
    path: string,
    init: { method: 'POST' | 'PUT'; body?: Record<string, unknown> },
  ): Promise<{ result?: unknown }> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: init.method,
      headers: {
        'content-type': 'application/json',
        ...(this.apiKey ? { 'api-key': this.apiKey } : {}),
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });

    const payload = (await response.json()) as { result?: unknown; status?: string };
    if (!response.ok) {
      throw new Error(`Qdrant request failed: ${response.status}`);
    }
    return payload;
  }
}
