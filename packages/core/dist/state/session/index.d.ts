import type { AgentSession, SessionStore } from '../../types/index.js';
export declare class InMemorySessionStore implements SessionStore {
    private readonly sessions;
    create(taskId: string, metadata?: Record<string, unknown>): Promise<AgentSession>;
    get(sessionId: string): Promise<AgentSession | undefined>;
    update(sessionId: string, patch: Partial<Omit<AgentSession, 'id' | 'taskId' | 'createdAt'>>): Promise<AgentSession>;
}
//# sourceMappingURL=index.d.ts.map