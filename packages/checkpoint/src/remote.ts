import * as fs from 'fs';
import * as path from 'path';
import type { Checkpoint } from './checkpoint';
import type { TaskState, TaskStatus } from './state-machine';
import { LocalCheckpointManager } from './local';

export interface WALEntry {
  seqId: number;
  taskId: string;
  timestamp: string;
  operation: string;
  payload: unknown;
  applied: boolean;
}

export class LocalWALStore {
  private walPath: string;
  private nextSeqId: number = 1;

  constructor(basePath: string, taskId: string) {
    fs.mkdirSync(basePath, { recursive: true });
    this.walPath = path.join(basePath, `${taskId}.wal`);
    if (fs.existsSync(this.walPath)) {
      const entries = this.readAll();
      if (entries.length > 0) {
        this.nextSeqId = entries[entries.length - 1].seqId + 1;
      }
    }
  }

  append(entry: Omit<WALEntry, 'seqId' | 'applied'>): number {
    const seqId = this.nextSeqId++;
    const full: WALEntry = { ...entry, seqId, applied: false };
    fs.appendFileSync(this.walPath, JSON.stringify(full) + '\n', 'utf-8');
    return seqId;
  }

  getUnapplied(taskId: string): WALEntry[] {
    return this.readAll().filter(e => !e.applied && e.taskId === taskId);
  }

  markApplied(seqId: number): void {
    const entries = this.readAll().map(e =>
      e.seqId === seqId ? { ...e, applied: true } : e,
    );
    fs.writeFileSync(this.walPath, entries.map(e => JSON.stringify(e)).join('\n') + '\n', 'utf-8');
  }

  private readAll(): WALEntry[] {
    if (!fs.existsSync(this.walPath)) return [];
    const content = fs.readFileSync(this.walPath, 'utf-8').trim();
    if (!content) return [];
    return content.split('\n').map(line => JSON.parse(line) as WALEntry);
  }
}

export class RemoteCheckpointManager {
  private walStore: LocalWALStore;
  private localManager: LocalCheckpointManager;
  private taskId: string;

  constructor(basePath: string, taskId: string) {
    this.taskId = taskId;
    this.walStore = new LocalWALStore(path.join(basePath, 'wal'), taskId);
    this.localManager = new LocalCheckpointManager(path.join(basePath, 'checkpoints'));
  }

  appendWAL(operation: string, payload: unknown): number {
    return this.walStore.append({
      taskId: this.taskId,
      timestamp: new Date().toISOString(),
      operation,
      payload,
    });
  }

  async recover(taskId: string): Promise<TaskState | null> {
    const checkpoint = await this.localManager.loadLatest(taskId);
    if (!checkpoint) return null;

    const unapplied = this.walStore.getUnapplied(taskId);

    let state: TaskState = {
      taskId,
      sessionId: checkpoint.sessionId,
      status: 'paused',
      createdAt: checkpoint.timestamp,
      updatedAt: checkpoint.timestamp,
      latestCheckpointId: checkpoint.checkpointId,
      retryCount: 0,
      maxRetries: 3,
    };

    for (const entry of unapplied) {
      state = this.applyWALEntry(state, entry);
    }

    return state;
  }

  async createCheckpoint(taskId: string, checkpoint: Checkpoint): Promise<void> {
    await this.localManager.save(checkpoint);

    const unapplied = this.walStore.getUnapplied(taskId);
    for (const entry of unapplied) {
      this.walStore.markApplied(entry.seqId);
    }
  }

  private applyWALEntry(state: TaskState, entry: WALEntry): TaskState {
    const payload = entry.payload as Record<string, unknown>;
    switch (entry.operation) {
      case 'status_change':
        return { ...state, status: payload.status as TaskStatus, updatedAt: entry.timestamp };
      case 'error':
        return {
          ...state,
          status: 'failed',
          updatedAt: entry.timestamp,
          error: payload as TaskState['error'],
        };
      case 'retry':
        return { ...state, status: 'running', retryCount: state.retryCount + 1, updatedAt: entry.timestamp };
      default:
        return { ...state, updatedAt: entry.timestamp };
    }
  }
}
