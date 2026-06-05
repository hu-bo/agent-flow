import type { SessionMemoryRecord, SessionMemoryStore } from './types.js';
export declare class InMemorySessionMemoryStore implements SessionMemoryStore {
    private readonly recordsBySession;
    append(record: SessionMemoryRecord): Promise<void>;
    list(sessionId: string): Promise<SessionMemoryRecord[]>;
    clear(sessionId: string): Promise<void>;
}
//# sourceMappingURL=session-memory.d.ts.map