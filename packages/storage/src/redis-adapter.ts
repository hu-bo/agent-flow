import type { KeyValueStore } from './types.js';

export interface RedisTransport {
  send(command: string, args: string[]): Promise<unknown>;
}

export interface UpstashRedisTransportOptions {
  baseUrl: string;
  token: string;
}

export class UpstashRedisTransport implements RedisTransport {
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(options: UpstashRedisTransportOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/g, '');
    this.token = options.token;
  }

  async send(command: string, args: string[]): Promise<unknown> {
    const encodedArgs = args.map((arg) => encodeURIComponent(arg));
    const url = `${this.baseUrl}/${command}/${encodedArgs.join('/')}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    const payload = (await response.json()) as { result?: unknown; error?: string };
    if (!response.ok || payload.error) {
      throw new Error(payload.error ?? `Redis command failed: ${response.status}`);
    }

    return payload.result;
  }
}

export class RedisStorageAdapter implements KeyValueStore {
  constructor(private readonly transport: RedisTransport) {}

  async get(key: string): Promise<string | null> {
    const result = await this.transport.send('get', [key]);
    if (result === null || result === undefined) {
      return null;
    }
    return String(result);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds !== undefined) {
      await this.transport.send('set', [key, value, 'EX', String(ttlSeconds)]);
      return;
    }
    await this.transport.send('set', [key, value]);
  }

  async delete(key: string): Promise<void> {
    await this.transport.send('del', [key]);
  }

  async increment(key: string, by = 1): Promise<number> {
    const result = await this.transport.send('incrby', [key, String(by)]);
    const value = Number(result);
    if (Number.isNaN(value)) {
      throw new Error('Redis returned non-numeric result for incrby.');
    }
    return value;
  }
}
