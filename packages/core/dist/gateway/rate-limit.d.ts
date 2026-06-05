export interface RateLimitConfig {
    requestsPerMinute: number;
    tokensPerMinute?: number;
    maxConcurrent?: number;
}
export declare class RateLimiter {
    private buckets;
    private configs;
    private defaultConfig;
    constructor(defaultConfig?: RateLimitConfig);
    configure(modelId: string, config: RateLimitConfig): void;
    acquire(modelId: string): Promise<void>;
    release(modelId: string): void;
    private getOrCreateBucket;
    private refillBucket;
}
//# sourceMappingURL=rate-limit.d.ts.map