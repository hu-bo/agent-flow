export class InMemorySessionMemoryStore {
    recordsBySession = new Map();
    async append(record) {
        const existing = this.recordsBySession.get(record.sessionId) ?? [];
        existing.push({ ...record, metadata: { ...record.metadata } });
        this.recordsBySession.set(record.sessionId, existing);
    }
    async list(sessionId) {
        const existing = this.recordsBySession.get(sessionId) ?? [];
        return existing.map((item) => ({ ...item, metadata: { ...item.metadata } }));
    }
    async clear(sessionId) {
        this.recordsBySession.delete(sessionId);
    }
}
//# sourceMappingURL=session-memory.js.map