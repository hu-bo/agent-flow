import type { AgentEvent, ReplayEventRecord, ReplayStore } from '../../types/index.js';
export declare class InMemoryReplayStore implements ReplayStore {
    private readonly recordsBySession;
    append(sessionId: string, event: AgentEvent): Promise<ReplayEventRecord>;
    list(sessionId: string, cursor?: number): Promise<ReplayEventRecord[]>;
}
//# sourceMappingURL=index.d.ts.map