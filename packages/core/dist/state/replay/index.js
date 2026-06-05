let replayCounter = 0;
function nextReplayId() {
    replayCounter += 1;
    return `replay_${Date.now()}_${replayCounter}`;
}
export class InMemoryReplayStore {
    recordsBySession = new Map();
    async append(sessionId, event) {
        const records = this.recordsBySession.get(sessionId) ?? [];
        const record = {
            id: nextReplayId(),
            sessionId,
            cursor: records.length,
            event,
            createdAt: new Date().toISOString()
        };
        records.push(record);
        this.recordsBySession.set(sessionId, records);
        return record;
    }
    async list(sessionId, cursor = 0) {
        const records = this.recordsBySession.get(sessionId) ?? [];
        if (cursor <= 0) {
            return [...records];
        }
        return records.filter((record) => record.cursor >= cursor);
    }
}
//# sourceMappingURL=index.js.map