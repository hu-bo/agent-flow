export declare class MemoryStore<V = unknown> {
    private maxSize;
    private cache;
    constructor(maxSize?: number);
    get(key: string): V | undefined;
    set(key: string, value: V): void;
    delete(key: string): boolean;
    has(key: string): boolean;
    clear(): void;
    get size(): number;
}
//# sourceMappingURL=memory-store.d.ts.map