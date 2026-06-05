import * as fs from 'fs';
import * as path from 'path';
import { LocalCheckpointManager } from './local.js';
export class LocalWALStore {
    walPath;
    nextSeqId = 1;
    constructor(basePath, taskId) {
        fs.mkdirSync(basePath, { recursive: true });
        this.walPath = path.join(basePath, `${taskId}.wal`);
        if (fs.existsSync(this.walPath)) {
            const entries = this.readAll();
            if (entries.length > 0) {
                this.nextSeqId = entries[entries.length - 1].seqId + 1;
            }
        }
    }
    append(entry) {
        const seqId = this.nextSeqId++;
        const full = { ...entry, seqId, applied: false };
        fs.appendFileSync(this.walPath, JSON.stringify(full) + '\n', 'utf-8');
        return seqId;
    }
    getUnapplied(taskId) {
        return this.readAll().filter(e => !e.applied && e.taskId === taskId);
    }
    markApplied(seqId) {
        const entries = this.readAll().map(e => e.seqId === seqId ? { ...e, applied: true } : e);
        fs.writeFileSync(this.walPath, entries.map(e => JSON.stringify(e)).join('\n') + '\n', 'utf-8');
    }
    readAll() {
        if (!fs.existsSync(this.walPath))
            return [];
        const content = fs.readFileSync(this.walPath, 'utf-8').trim();
        if (!content)
            return [];
        return content.split('\n').map(line => JSON.parse(line));
    }
}
export class RemoteCheckpointManager {
    walStore;
    localManager;
    taskId;
    constructor(basePath, taskId) {
        this.taskId = taskId;
        this.walStore = new LocalWALStore(path.join(basePath, 'wal'), taskId);
        this.localManager = new LocalCheckpointManager(path.join(basePath, 'checkpoints'));
    }
    appendWAL(operation, payload) {
        return this.walStore.append({
            taskId: this.taskId,
            timestamp: new Date().toISOString(),
            operation,
            payload,
        });
    }
    async recover(taskId) {
        const checkpoint = await this.localManager.loadLatest(taskId);
        if (!checkpoint)
            return null;
        const unapplied = this.walStore.getUnapplied(taskId);
        let state = {
            taskId,
            sessionId: checkpoint.sessionId,
            status: 'paused',
            createdAt: checkpoint.timestamp,
            updatedAt: checkpoint.timestamp,
            latestCheckpointId: checkpoint.checkpointId,
            retryCount: 0,
            maxRetries: 3,
        };
        for (const entry of unapplied) {
            state = this.applyWALEntry(state, entry);
        }
        return state;
    }
    async createCheckpoint(taskId, checkpoint) {
        await this.localManager.save(checkpoint);
        const unapplied = this.walStore.getUnapplied(taskId);
        for (const entry of unapplied) {
            this.walStore.markApplied(entry.seqId);
        }
    }
    applyWALEntry(state, entry) {
        const payload = entry.payload;
        switch (entry.operation) {
            case 'status_change':
                return { ...state, status: payload.status, updatedAt: entry.timestamp };
            case 'error':
                return {
                    ...state,
                    status: 'failed',
                    updatedAt: entry.timestamp,
                    error: payload,
                };
            case 'retry':
                return { ...state, status: 'running', retryCount: state.retryCount + 1, updatedAt: entry.timestamp };
            default:
                return { ...state, updatedAt: entry.timestamp };
        }
    }
}
//# sourceMappingURL=remote.js.map