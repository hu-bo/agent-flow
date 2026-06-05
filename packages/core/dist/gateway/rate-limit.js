import { RateLimitError } from '../messages/index.js';
export class RateLimiter {
    buckets = new Map();
    configs = new Map();
    defaultConfig;
    constructor(defaultConfig) {
        this.defaultConfig = defaultConfig ?? { requestsPerMinute: 60 };
    }
    configure(modelId, config) {
        this.configs.set(modelId, config);
    }
    async acquire(modelId) {
        const config = this.configs.get(modelId) ?? this.defaultConfig;
        const bucket = this.getOrCreateBucket(modelId, config);
        this.refillBucket(bucket, config);
        if (config.maxConcurrent !== undefined && bucket.concurrent >= config.maxConcurrent) {
            throw new RateLimitError(`Max concurrent requests (${config.maxConcurrent}) exceeded for ${modelId}`, undefined, undefined, modelId);
        }
        if (bucket.tokens < 1) {
            const msUntilRefill = 60000 / config.requestsPerMinute;
            throw new RateLimitError(`Rate limit exceeded for ${modelId}`, msUntilRefill, undefined, modelId);
        }
        bucket.tokens -= 1;
        bucket.concurrent += 1;
    }
    release(modelId) {
        const bucket = this.buckets.get(modelId);
        if (bucket && bucket.concurrent > 0) {
            bucket.concurrent -= 1;
        }
    }
    getOrCreateBucket(modelId, config) {
        let bucket = this.buckets.get(modelId);
        if (!bucket) {
            bucket = {
                tokens: config.requestsPerMinute,
                lastRefill: Date.now(),
                concurrent: 0,
            };
            this.buckets.set(modelId, bucket);
        }
        return bucket;
    }
    refillBucket(bucket, config) {
        const now = Date.now();
        const elapsed = now - bucket.lastRefill;
        const tokensToAdd = (elapsed / 60000) * config.requestsPerMinute;
        if (tokensToAdd >= 1) {
            bucket.tokens = Math.min(config.requestsPerMinute, bucket.tokens + tokensToAdd);
            bucket.lastRefill = now;
        }
    }
}
//# sourceMappingURL=rate-limit.js.map