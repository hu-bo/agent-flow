import type { AgentSession, AgentStatus, SessionStore } from '../../types/index.js';

let sessionCounter = 0;

function nextSessionId(): string {
  sessionCounter += 1;
  return `session_${Date.now()}_${sessionCounter}`;
}

export class InMemorySessionStore implements SessionStore {
  private readonly sessions = new Map<string, AgentSession>();

  async create(taskId: string, metadata: Record<string, unknown> = {}): Promise<AgentSession> {
    const now = new Date().toISOString();
    const session: AgentSession = {
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

  async get(sessionId: string): Promise<AgentSession | undefined> {
    return this.sessions.get(sessionId);
  }

  async update(
    sessionId: string,
    patch: Partial<Omit<AgentSession, 'id' | 'taskId' | 'createdAt'>>
  ): Promise<AgentSession> {
    const current = this.sessions.get(sessionId);
    if (!current) {
      throw new Error(`Session "${sessionId}" not found.`);
    }

    const nextStatus = patch.status ?? current.status;
    const status = nextStatus as AgentStatus;
    const updated: AgentSession = {
      ...current,
      ...patch,
      status,
      updatedAt: new Date().toISOString()
    };
    this.sessions.set(sessionId, updated);
    return updated;
  }
}
