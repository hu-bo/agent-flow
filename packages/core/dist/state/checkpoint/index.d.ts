import type { CheckpointRecord, CheckpointStore } from '../../types/index.js';
export declare class InMemoryCheckpointStore implements CheckpointStore {
    private readonly checkpointsBySession;
    save(record: Omit<CheckpointRecord, 'id' | 'createdAt'>): Promise<CheckpointRecord>;
    list(sessionId: string): Promise<CheckpointRecord[]>;
    latest(sessionId: string): Promise<CheckpointRecord | undefined>;
}
//# sourceMappingURL=index.d.ts.map