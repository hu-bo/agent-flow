export class QdrantStorageAdapter {
    baseUrl;
    collection;
    apiKey;
    constructor(options) {
        this.baseUrl = options.baseUrl.replace(/\/+$/g, '');
        this.collection = options.collection;
        this.apiKey = options.apiKey;
    }
    async upsert(points) {
        await this.request(`/collections/${this.collection}/points?wait=true`, {
            method: 'PUT',
            body: {
                points,
            },
        });
    }
    async search(query) {
        const payload = await this.request(`/collections/${this.collection}/points/search`, {
            method: 'POST',
            body: {
                vector: query.vector,
                limit: query.limit ?? 5,
                filter: query.filter,
                with_payload: true,
            },
        });
        const result = (payload.result ?? []);
        return result.map((item) => ({
            id: item.id,
            score: item.score,
            payload: item.payload,
        }));
    }
    async delete(ids) {
        await this.request(`/collections/${this.collection}/points/delete?wait=true`, {
            method: 'POST',
            body: {
                points: ids,
            },
        });
    }
    async request(path, init) {
        const response = await fetch(`${this.baseUrl}${path}`, {
            method: init.method,
            headers: {
                'content-type': 'application/json',
                ...(this.apiKey ? { 'api-key': this.apiKey } : {}),
            },
            body: init.body ? JSON.stringify(init.body) : undefined,
        });
        const payload = (await response.json());
        if (!response.ok) {
            throw new Error(`Qdrant request failed: ${response.status}`);
        }
        return payload;
    }
}
