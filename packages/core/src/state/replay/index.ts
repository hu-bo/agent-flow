import type { AgentEvent, ReplayEventRecord, ReplayStore } from '../../types/index.js';

let replayCounter = 0;

function nextReplayId(): string {
  replayCounter += 1;
  return `replay_${Date.now()}_${replayCounter}`;
}

export class InMemoryReplayStore implements ReplayStore {
  private readonly recordsBySession = new Map<string, ReplayEventRecord[]>();

  async append(sessionId: string, event: AgentEvent): Promise<ReplayEventRecord> {
    const records = this.recordsBySession.get(sessionId) ?? [];
    const record: ReplayEventRecord = {
      id: nextReplayId(),
      sessionId,
      cursor: records.length,
      event,
      createdAt: new Date().toISOString()
    };
    records.push(record);
    this.recordsBySession.set(sessionId, records);
    return record;
  }

  async list(sessionId: string, cursor = 0): Promise<ReplayEventRecord[]> {
    const records = this.recordsBySession.get(sessionId) ?? [];
    if (cursor <= 0) {
      return [...records];
    }
    return records.filter((record) => record.cursor >= cursor);
  }
}
