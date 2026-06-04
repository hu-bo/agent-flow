import {
  type AgentEvent,
  type AgentRunRequest,
  type AgentSession,
  type AgentStatus,
  type CheckpointRecord,
  type CheckpointStore,
  type ReplayEventRecord,
  type ReplayStore,
  type SessionStore,
} from '@agent-flow/core';
import { randomUUID } from 'node:crypto';
import type { Repository } from 'typeorm';
import type { AppDataSource } from '../db/data-source.js';
import { CoreRuntimeCheckpointEntity } from '../db/entities/core-runtime-checkpoint.entity.js';
import { CoreRuntimeReplayEntity } from '../db/entities/core-runtime-replay.entity.js';
import { CoreRuntimeSessionEntity } from '../db/entities/core-runtime-session.entity.js';

function nextSessionId(): string {
  return `core_session_${Date.now()}_${randomUUID().slice(0, 8)}`;
}

function nextCheckpointId(): string {
  return `core_cp_${Date.now()}_${randomUUID().slice(0, 8)}`;
}

function nextReplayId(): string {
  return `core_replay_${Date.now()}_${randomUUID().slice(0, 8)}`;
}

function toSessionRecord(entity: CoreRuntimeSessionEntity): AgentSession {
  return {
    id: entity.sessionId,
    taskId: entity.taskId,
    status: entity.status as AgentStatus,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
    metadata: entity.metadata ?? {},
    lastRequest: (entity.lastRequest as AgentRunRequest | null) ?? undefined,
  };
}

function toCheckpointRecord(entity: CoreRuntimeCheckpointEntity): CheckpointRecord {
  return {
    id: entity.checkpointId,
    sessionId: entity.sessionId,
    stepId: entity.stepId,
    createdAt: entity.createdAt.toISOString(),
    output: entity.output,
    metadata: entity.metadata ?? {},
  };
}

function toReplayRecord(entity: CoreRuntimeReplayEntity): ReplayEventRecord {
  return {
    id: entity.replayId,
    sessionId: entity.sessionId,
    cursor: entity.cursor,
    event: entity.event as unknown as AgentEvent,
    createdAt: entity.createdAt.toISOString(),
  };
}

export class DbSessionStore implements SessionStore {
  private readonly repository: Repository<CoreRuntimeSessionEntity>;

  constructor(db: AppDataSource) {
    this.repository = db.getRepository(CoreRuntimeSessionEntity);
  }

  async create(taskId: string, metadata: Record<string, unknown> = {}): Promise<AgentSession> {
    const entity = this.repository.create({
      sessionId: nextSessionId(),
      taskId,
      status: 'queued',
      metadata,
      lastRequest: null,
    });
    return toSessionRecord(await this.repository.save(entity));
  }

  async get(sessionId: string): Promise<AgentSession | undefined> {
    const entity = await this.repository.findOne({
      where: { sessionId },
    });
    return entity ? toSessionRecord(entity) : undefined;
  }

  async update(
    sessionId: string,
    patch: Partial<Omit<AgentSession, 'id' | 'taskId' | 'createdAt'>>,
  ): Promise<AgentSession> {
    const entity = await this.repository.findOne({
      where: { sessionId },
    });
    if (!entity) {
      throw new Error(`Session "${sessionId}" not found.`);
    }

    if (patch.status) {
      entity.status = patch.status;
    }
    if (patch.metadata) {
      entity.metadata = patch.metadata;
    }
    if (patch.lastRequest !== undefined) {
      entity.lastRequest = (patch.lastRequest ?? null) as unknown as Record<string, unknown> | null;
    }
    return toSessionRecord(await this.repository.save(entity));
  }
}

export class DbCheckpointStore implements CheckpointStore {
  private readonly repository: Repository<CoreRuntimeCheckpointEntity>;

  constructor(db: AppDataSource) {
    this.repository = db.getRepository(CoreRuntimeCheckpointEntity);
  }

  async save(record: Omit<CheckpointRecord, 'id' | 'createdAt'>): Promise<CheckpointRecord> {
    const entity = this.repository.create({
      checkpointId: nextCheckpointId(),
      sessionId: record.sessionId,
      stepId: record.stepId,
      output: record.output,
      metadata: record.metadata,
    });
    return toCheckpointRecord(await this.repository.save(entity));
  }

  async list(sessionId: string): Promise<CheckpointRecord[]> {
    const entities = await this.repository.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
    });
    return entities.map(toCheckpointRecord);
  }

  async latest(sessionId: string): Promise<CheckpointRecord | undefined> {
    const entity = await this.repository.findOne({
      where: { sessionId },
      order: { createdAt: 'DESC' },
    });
    return entity ? toCheckpointRecord(entity) : undefined;
  }
}

export class DbReplayStore implements ReplayStore {
  private readonly repository: Repository<CoreRuntimeReplayEntity>;

  constructor(db: AppDataSource) {
    this.repository = db.getRepository(CoreRuntimeReplayEntity);
  }

  async append(sessionId: string, event: AgentEvent): Promise<ReplayEventRecord> {
    const last = await this.repository.findOne({
      where: { sessionId },
      order: { cursor: 'DESC' },
    });
    const entity = this.repository.create({
      replayId: nextReplayId(),
      sessionId,
      cursor: (last?.cursor ?? -1) + 1,
      event: event as unknown as Record<string, unknown>,
    });
    return toReplayRecord(await this.repository.save(entity));
  }

  async list(sessionId: string, cursor = 0): Promise<ReplayEventRecord[]> {
    const entities = await this.repository.find({
      where: {
        sessionId,
      },
      order: { cursor: 'ASC' },
    });
    return entities
      .map(toReplayRecord)
      .filter((record) => record.cursor >= cursor);
  }
}
