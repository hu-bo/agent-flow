import type { Checkpoint } from './checkpoint.js';
import type { TaskState } from './state-machine.js';
export interface WALEntry {
    seqId: number;
    taskId: string;
    timestamp: string;
    operation: string;
    payload: unknown;
    applied: boolean;
}
export declare class LocalWALStore {
    private walPath;
    private nextSeqId;
    constructor(basePath: string, taskId: string);
    append(entry: Omit<WALEntry, 'seqId' | 'applied'>): number;
    getUnapplied(taskId: string): WALEntry[];
    markApplied(seqId: number): void;
    private readAll;
}
export declare class RemoteCheckpointManager {
    private walStore;
    private localManager;
    private taskId;
    constructor(basePath: string, taskId: string);
    appendWAL(operation: string, payload: unknown): number;
    recover(taskId: string): Promise<TaskState | null>;
    createCheckpoint(taskId: string, checkpoint: Checkpoint): Promise<void>;
    private applyWALEntry;
}
//# sourceMappingURL=remote.d.ts.map