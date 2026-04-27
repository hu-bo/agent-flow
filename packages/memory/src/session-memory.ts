import type { SessionMemoryRecord, SessionMemoryStore } from './types.js';

export class InMemorySessionMemoryStore implements SessionMemoryStore {
  private readonly recordsBySession = new Map<string, SessionMemoryRecord[]>();

  async append(record: SessionMemoryRecord): Promise<void> {
    const existing = this.recordsBySession.get(record.sessionId) ?? [];
    existing.push({ ...record, metadata: { ...record.metadata } });
    this.recordsBySession.set(record.sessionId, existing);
  }

  async list(sessionId: string): Promise<SessionMemoryRecord[]> {
    const existing = this.recordsBySession.get(sessionId) ?? [];
    return existing.map((item) => ({ ...item, metadata: { ...item.metadata } }));
  }

  async clear(sessionId: string): Promise<void> {
    this.recordsBySession.delete(sessionId);
  }
}
