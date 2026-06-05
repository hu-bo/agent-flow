export class InMemoryKeyValueStore {
    store = new Map();
    async get(key) {
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
    async set(key, value, ttlSeconds) {
        const expiresAt = ttlSeconds !== undefined ? Date.now() + ttlSeconds * 1000 : undefined;
        this.store.set(key, { value, expiresAt });
    }
    async delete(key) {
        this.store.delete(key);
    }
    async increment(key, by = 1) {
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
export class InMemoryVectorStore {
    points = new Map();
    async upsert(points) {
        for (const point of points) {
            this.points.set(point.id, {
                ...point,
                vector: [...point.vector],
                payload: point.payload ? { ...point.payload } : undefined,
            });
        }
    }
    async search(query) {
        const limit = query.limit ?? 5;
        const result = [];
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
    async delete(ids) {
        for (const id of ids) {
            this.points.delete(id);
        }
    }
}
function cosineSimilarity(left, right) {
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
//# sourceMappingURL=in-memory.js.map