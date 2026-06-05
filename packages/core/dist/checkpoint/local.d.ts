import type { Checkpoint } from './checkpoint.js';
/** Local file-based checkpoint manager */
export declare class LocalCheckpointManager {
    private basePath;
    constructor(basePath: string);
    save(checkpoint: Checkpoint): Promise<void>;
    loadLatest(sessionId: string): Promise<Checkpoint | null>;
    prune(sessionId: string, keepCount?: number): Promise<void>;
}
//# sourceMappingURL=local.d.ts.map