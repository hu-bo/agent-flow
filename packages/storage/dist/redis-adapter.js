export class UpstashRedisTransport {
    baseUrl;
    token;
    constructor(options) {
        this.baseUrl = options.baseUrl.replace(/\/+$/g, '');
        this.token = options.token;
    }
    async send(command, args) {
        const encodedArgs = args.map((arg) => encodeURIComponent(arg));
        const url = `${this.baseUrl}/${command}/${encodedArgs.join('/')}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
        });
        const payload = (await response.json());
        if (!response.ok || payload.error) {
            throw new Error(payload.error ?? `Redis command failed: ${response.status}`);
        }
        return payload.result;
    }
}
export class RedisStorageAdapter {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    async get(key) {
        const result = await this.transport.send('get', [key]);
        if (result === null || result === undefined) {
            return null;
        }
        return String(result);
    }
    async set(key, value, ttlSeconds) {
        if (ttlSeconds !== undefined) {
            await this.transport.send('set', [key, value, 'EX', String(ttlSeconds)]);
            return;
        }
        await this.transport.send('set', [key, value]);
    }
    async delete(key) {
        await this.transport.send('del', [key]);
    }
    async increment(key, by = 1) {
        const result = await this.transport.send('incrby', [key, String(by)]);
        const value = Number(result);
        if (Number.isNaN(value)) {
            throw new Error('Redis returned non-numeric result for incrby.');
        }
        return value;
    }
}
