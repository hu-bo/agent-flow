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
import { In, type Repository } from 'typeorm';
import type { AppDataSource } from '../db/data-source.js';
import { ChatMessageEntity } from '../db/entities/chat-message.entity.js';
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
  private readonly chatMessageRepository: Repository<ChatMessageEntity>;

  constructor(db: AppDataSource) {
    this.repository = db.getRepository(CoreRuntimeSessionEntity);
    this.chatMessageRepository = db.getRepository(ChatMessageEntity);
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

  async recoverInterruptedSessions(replayStore: DbReplayStore, recoveredAt = new Date()): Promise<number> {
    const interrupted = await this.repository.find({
      where: { status: In(['queued', 'running']) },
      order: { createdAt: 'ASC' },
    });

    for (const entity of interrupted) {
      const previousStatus = entity.status;
      const events = await replayStore.list(entity.sessionId);
      const reason = 'Core runtime execution was interrupted by a web-server restart.';
      entity.status = 'failed';
      entity.metadata = {
        ...(entity.metadata ?? {}),
        recovery: {
          type: 'process_restart',
          previousStatus,
          recoveredAt: recoveredAt.toISOString(),
          reason,
        },
      };
      await this.repository.save(entity);

      const started = events.find((record) => record.event.type === 'session.started')?.event;
      const steps = Array.isArray(started?.payload.steps) ? started.payload.steps : [];
      const terminalStepIds = new Set(
        events
          .filter((record) => record.event.type === 'step.completed' || record.event.type === 'step.failed')
          .map((record) => record.event.payload.stepId)
          .filter((stepId): stepId is string => typeof stepId === 'string'),
      );

      for (const value of steps) {
        if (!value || typeof value !== 'object') continue;
        const step = value as Record<string, unknown>;
        const stepId = typeof step.id === 'string' ? step.id : undefined;
        if (!stepId || terminalStepIds.has(stepId)) continue;
        await replayStore.append(entity.sessionId, {
          id: `event_${randomUUID()}`,
          taskId: entity.taskId,
          sessionId: entity.sessionId,
          type: 'step.failed',
          timestamp: recoveredAt.toISOString(),
          payload: {
            stepId,
            title: typeof step.title === 'string' ? step.title : stepId,
            kind: typeof step.kind === 'string' ? step.kind : 'tool',
            error: reason,
            failureType: 'process_restart',
            recovered: true,
          },
        });
      }

      await replayStore.append(entity.sessionId, {
        id: `event_${randomUUID()}`,
        taskId: entity.taskId,
        sessionId: entity.sessionId,
        type: 'session.failed',
        timestamp: recoveredAt.toISOString(),
        payload: {
          error: reason,
          failureType: 'process_restart',
          previousStatus,
          recovered: true,
        },
      });
      await this.terminalizeThinkingMessage(entity, reason, recoveredAt);
    }

    const previouslyRecovered = await this.repository.find({
      where: { status: 'failed' },
      order: { createdAt: 'ASC' },
    });
    for (const entity of previouslyRecovered) {
      const recovery = entity.metadata?.recovery;
      if (!recovery || typeof recovery !== 'object') continue;
      const recoveryRecord = recovery as Record<string, unknown>;
      if (recoveryRecord.type !== 'process_restart') continue;
      const reason = typeof recoveryRecord.reason === 'string'
        ? recoveryRecord.reason
        : 'Core runtime execution was interrupted by a web-server restart.';
      const recoveredAtValue = typeof recoveryRecord.recoveredAt === 'string'
        ? new Date(recoveryRecord.recoveredAt)
        : recoveredAt;
      await this.terminalizeThinkingMessage(
        entity,
        reason,
        Number.isNaN(recoveredAtValue.getTime()) ? recoveredAt : recoveredAtValue,
      );
    }

    return interrupted.length;
  }

  private async terminalizeThinkingMessage(
    entity: CoreRuntimeSessionEntity,
    reason: string,
    recoveredAt: Date,
  ): Promise<void> {
    const requestId = entity.metadata?.requestId;
    if (typeof requestId !== 'string' || !requestId) return;
    const messageId = `runtime_thinking_${requestId.replace(/[^A-Za-z0-9_-]/g, '_')}`;
    const message = await this.chatMessageRepository.findOne({ where: { messageId } });
    if (!message) return;
    if (message.payload.type !== 'thinking') return;
    const needsRecovery =
      message.payload.status === 'pending' ||
      message.payload.status === 'running' ||
      message.payload.items?.some((item) => item.status === 'pending' || item.status === 'running') ||
      / - (pending|running)$/m.test(message.payload.text);
    if (!needsRecovery) return;

    message.payload = terminalizeThinkingPayload(message.payload, reason, recoveredAt);
    message.timestamp = recoveredAt;
    await this.chatMessageRepository.save(message);
  }
}

function terminalizeThinkingPayload(
  payload: ChatMessageEntity['payload'],
  reason: string,
  recoveredAt: Date,
): ChatMessageEntity['payload'] {
  if (payload.type !== 'thinking') {
    return payload;
  }

  const items = (payload.items ?? []).map((item) => ({
    ...item,
    status: item.status === 'pending' || item.status === 'running' ? 'error' as const : item.status,
    content: item.key === 'plan'
      ? item.content?.replace(/ - (pending|running)$/gm, ' - error')
      : item.content,
  }));
  if (!items.some((item) => item.key === 'process-restart')) {
    items.push({
      key: 'process-restart',
      title: 'Execution interrupted',
      status: 'error',
      content: reason,
    });
  }

  return {
    ...payload,
    title: 'Complete thinking',
    status: 'error',
    text: items
      .map((item) => item.content ? `## ${item.title ?? item.key}\n${item.content}` : `## ${item.title ?? item.key}`)
      .join('\n\n'),
    items,
    timestamp: recoveredAt.toISOString(),
    metadata: {
      ...payload.metadata,
      extensions: {
        ...(payload.metadata.extensions ?? {}),
        status: 'error',
        recovery: {
          type: 'process_restart',
          recoveredAt: recoveredAt.toISOString(),
          reason,
        },
      },
    },
  };
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
