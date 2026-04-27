export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  increment(key: string, by?: number): Promise<number>;
}

export interface VectorPoint {
  id: string | number;
  vector: number[];
  payload?: Record<string, unknown>;
}

export interface VectorQuery {
  vector: number[];
  limit?: number;
  filter?: Record<string, unknown>;
}

export interface VectorQueryResult {
  id: string | number;
  score: number;
  payload?: Record<string, unknown>;
}

export interface VectorStore {
  upsert(points: VectorPoint[]): Promise<void>;
  search(query: VectorQuery): Promise<VectorQueryResult[]>;
  delete(ids: Array<string | number>): Promise<void>;
}
