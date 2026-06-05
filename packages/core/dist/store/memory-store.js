export class MemoryStore {
    maxSize;
    cache = new Map();
    constructor(maxSize = 100) {
        this.maxSize = maxSize;
    }
    get(key) {
        const value = this.cache.get(key);
        if (value !== undefined) {
            // LRU refresh: delete and re-set to move to end
            this.cache.delete(key);
            this.cache.set(key, value);
        }
        return value;
    }
    set(key, value) {
        // If key already exists, delete first to refresh position
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        this.cache.set(key, value);
        // Evict oldest if over capacity
        if (this.cache.size > this.maxSize) {
            const oldest = this.cache.keys().next().value;
            this.cache.delete(oldest);
        }
    }
    delete(key) {
        return this.cache.delete(key);
    }
    has(key) {
        return this.cache.has(key);
    }
    clear() {
        this.cache.clear();
    }
    get size() {
        return this.cache.size;
    }
}
//# sourceMappingURL=memory-store.js.map