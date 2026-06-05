import type { KeyValueStore } from './types.js';
export interface RedisTransport {
    send(command: string, args: string[]): Promise<unknown>;
}
export interface UpstashRedisTransportOptions {
    baseUrl: string;
    token: string;
}
export declare class UpstashRedisTransport implements RedisTransport {
    private readonly baseUrl;
    private readonly token;
    constructor(options: UpstashRedisTransportOptions);
    send(command: string, args: string[]): Promise<unknown>;
}
export declare class RedisStorageAdapter implements KeyValueStore {
    private readonly transport;
    constructor(transport: RedisTransport);
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    delete(key: string): Promise<void>;
    increment(key: string, by?: number): Promise<number>;
}
//# sourceMappingURL=redis-adapter.d.ts.map