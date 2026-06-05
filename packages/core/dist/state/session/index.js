let sessionCounter = 0;
function nextSessionId() {
    sessionCounter += 1;
    return `session_${Date.now()}_${sessionCounter}`;
}
export class InMemorySessionStore {
    sessions = new Map();
    async create(taskId, metadata = {}) {
        const now = new Date().toISOString();
        const session = {
            id: nextSessionId(),
            taskId,
            status: 'queued',
            createdAt: now,
            updatedAt: now,
            metadata
        };
        this.sessions.set(session.id, session);
        return session;
    }
    async get(sessionId) {
        return this.sessions.get(sessionId);
    }
    async update(sessionId, patch) {
        const current = this.sessions.get(sessionId);
        if (!current) {
            throw new Error(`Session "${sessionId}" not found.`);
        }
        const nextStatus = patch.status ?? current.status;
        const status = nextStatus;
        const updated = {
            ...current,
            ...patch,
            status,
            updatedAt: new Date().toISOString()
        };
        this.sessions.set(sessionId, updated);
        return updated;
    }
}
//# sourceMappingURL=index.js.map