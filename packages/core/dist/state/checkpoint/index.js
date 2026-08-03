let checkpointCounter = 0;
function nextCheckpointId() {
    checkpointCounter += 1;
    return `cp_${Date.now()}_${checkpointCounter}`;
}
export class InMemoryCheckpointStore {
    checkpointsBySession = new Map();
    async save(record) {
        const checkpoint = {
            ...record,
            id: nextCheckpointId(),
            createdAt: new Date().toISOString()
        };
        const checkpoints = this.checkpointsBySession.get(record.sessionId) ?? [];
        checkpoints.push(checkpoint);
        this.checkpointsBySession.set(record.sessionId, checkpoints);
        return checkpoint;
    }
    async list(sessionId) {
        return [...(this.checkpointsBySession.get(sessionId) ?? [])];
    }
    async latest(sessionId) {
        const checkpoints = this.checkpointsBySession.get(sessionId) ?? [];
        return checkpoints.length > 0 ? checkpoints[checkpoints.length - 1] : undefined;
    }
}
