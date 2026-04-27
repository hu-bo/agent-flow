import type { CheckpointRecord, CheckpointStore } from '../../types/index.js';

let checkpointCounter = 0;

function nextCheckpointId(): string {
  checkpointCounter += 1;
  return `cp_${Date.now()}_${checkpointCounter}`;
}

export class InMemoryCheckpointStore implements CheckpointStore {
  private readonly checkpointsBySession = new Map<string, CheckpointRecord[]>();

  async save(record: Omit<CheckpointRecord, 'id' | 'createdAt'>): Promise<CheckpointRecord> {
    const checkpoint: CheckpointRecord = {
      ...record,
      id: nextCheckpointId(),
      createdAt: new Date().toISOString()
    };

    const checkpoints = this.checkpointsBySession.get(record.sessionId) ?? [];
    checkpoints.push(checkpoint);
    this.checkpointsBySession.set(record.sessionId, checkpoints);
    return checkpoint;
  }

  async list(sessionId: string): Promise<CheckpointRecord[]> {
    return [...(this.checkpointsBySession.get(sessionId) ?? [])];
  }

  async latest(sessionId: string): Promise<CheckpointRecord | undefined> {
    const checkpoints = this.checkpointsBySession.get(sessionId) ?? [];
    return checkpoints.length > 0 ? checkpoints[checkpoints.length - 1] : undefined;
  }
}
