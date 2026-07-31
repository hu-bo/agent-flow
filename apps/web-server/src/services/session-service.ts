import { randomUUID } from 'node:crypto';
import type { ToolExecutionMessage, UnifiedMessage } from '@agent-flow/core/messages';
import type { Repository } from 'typeorm';
import type { AppDataSource } from '../db/data-source.js';
import { ChatMessageEntity } from '../db/entities/chat-message.entity.js';
import { ChatSessionEntity } from '../db/entities/chat-session.entity.js';
import { ProjectEntity } from '../db/entities/project.entity.js';
import type { SessionMode, SessionRecord, SessionState, SpecWorkflowState } from '../contracts/api.js';
import { NotFoundError } from '../lib/errors.js';
import { getMessageText } from '../lib/messages.js';

interface CreateSessionInput {
  ownerUserId: string;
  projectId?: string;
  modelId: number;
  mode: SessionMode;
  cwd: string;
  systemPrompt?: string;
  title?: string;
}

const MAX_SESSION_TITLE_LENGTH = 30;

function normalizeSessionTitle(text: string | undefined): string | undefined {
  const normalized = (text ?? '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) return undefined;
  return normalized.length > MAX_SESSION_TITLE_LENGTH
    ? `${normalized.slice(0, MAX_SESSION_TITLE_LENGTH).trimEnd()}...`
    : normalized;
}

function extractUserQueryTitle(messages: UnifiedMessage[]): string | undefined {
  const firstUserMessage = messages.find((message) => message.role === 'user');
  const text = firstUserMessage ? getMessageText(firstUserMessage) : undefined;

  return normalizeSessionTitle(text);
}

export class SessionService {
  private readonly sessionRepository: Repository<ChatSessionEntity>;
  private readonly messageRepository: Repository<ChatMessageEntity>;
  private readonly projectRepository: Repository<ProjectEntity>;

  constructor(
    db: AppDataSource,
    private readonly defaultCwd: string,
  ) {
    this.sessionRepository = db.getRepository(ChatSessionEntity);
    this.messageRepository = db.getRepository(ChatMessageEntity);
    this.projectRepository = db.getRepository(ProjectEntity);
  }

  async listSessions(ownerUserId: string, options: { projectId?: string } = {}): Promise<SessionRecord[]> {
    const sessions = await this.sessionRepository.find({
      where: {
        ownerUserId,
        ...(options.projectId ? { projectId: options.projectId } : {}),
      },
      order: { updatedAt: 'DESC' },
    });
    return sessions.map(toSessionRecord);
  }

  async createSession(input: Partial<CreateSessionInput> & Pick<CreateSessionInput, 'modelId' | 'ownerUserId'>): Promise<SessionRecord> {
    const project = input.projectId
      ? await this.projectRepository.findOne({
          where: {
            projectId: input.projectId,
            ownerUserId: input.ownerUserId,
          },
        })
      : null;
    if (input.projectId && !project) {
      throw new NotFoundError(`Project not found: ${input.projectId}`);
    }

    const entity = this.sessionRepository.create({
      sessionId: randomUUID(),
      ownerUserId: input.ownerUserId,
      projectId: project?.projectId ?? null,
      modelId: input.modelId,
      mode: input.mode ?? 'vibe',
      cwd: project?.rootPath ?? input.cwd ?? this.defaultCwd,
      messageCount: 0,
      title: normalizeSessionTitle(input.title) ?? null,
      systemPrompt: input.systemPrompt ?? null,
      latestCheckpointId: '',
      boundRunnerId: project?.defaultRunnerId ?? null,
      specWorkflow:
        input.mode === 'spec'
          ? {
              phase: 'requirements',
              awaitingConfirm: false,
              documents: {},
            } satisfies SpecWorkflowState
          : null,
    });

    const saved = await this.sessionRepository.save(entity);
    if (project) {
      project.updatedAt = new Date();
      await this.projectRepository.save(project);
    }
    return toSessionRecord(saved);
  }

  async getSessionState(sessionId: string, ownerUserId?: string): Promise<SessionState> {
    const session = await this.getSessionEntity(sessionId, ownerUserId);
    const messages = await this.listMessages(sessionId);
    return {
      session: toSessionRecord(session),
      messages,
    };
  }

  async getSession(sessionId: string, ownerUserId?: string): Promise<SessionRecord> {
    return toSessionRecord(await this.getSessionEntity(sessionId, ownerUserId));
  }

  async getLatestSession(ownerUserId: string): Promise<SessionRecord | undefined> {
    const latest = await this.sessionRepository.findOne({
      where: { ownerUserId },
      order: { updatedAt: 'DESC' },
    });
    return latest ? toSessionRecord(latest) : undefined;
  }

  async deleteSession(sessionId: string, ownerUserId?: string): Promise<void> {
    const session = await this.getSessionEntity(sessionId, ownerUserId);
    await this.sessionRepository.delete({ sessionId: session.sessionId });
  }

  async updateSessionModel(sessionId: string, modelId: number, ownerUserId?: string): Promise<SessionRecord> {
    const session = await this.getSessionEntity(sessionId, ownerUserId);
    session.modelId = modelId;
    session.updatedAt = new Date();
    return toSessionRecord(await this.sessionRepository.save(session));
  }

  async refreshProjectCwd(sessionId: string, ownerUserId?: string): Promise<SessionRecord> {
    const session = await this.getSessionEntity(sessionId, ownerUserId);
    if (!session.projectId) {
      return toSessionRecord(session);
    }

    const project = await this.projectRepository.findOne({
      where: {
        projectId: session.projectId,
        ...(ownerUserId ? { ownerUserId } : {}),
      },
    });
    if (!project) {
      throw new NotFoundError(`Project not found: ${session.projectId}`);
    }

    if (session.cwd !== project.rootPath) {
      session.cwd = project.rootPath;
      session.boundRunnerId = project.defaultRunnerId ?? session.boundRunnerId;
      session.updatedAt = new Date();
      return toSessionRecord(await this.sessionRepository.save(session));
    }

    if (!session.boundRunnerId && project.defaultRunnerId) {
      session.boundRunnerId = project.defaultRunnerId;
      session.updatedAt = new Date();
      return toSessionRecord(await this.sessionRepository.save(session));
    }

    return toSessionRecord(session);
  }

  async listMessages(sessionId: string): Promise<UnifiedMessage[]> {
    const rows = await this.messageRepository.find({
      where: { sessionId },
      order: { sequence: 'ASC' },
    });
    return rows.map((row) => row.payload);
  }

  async appendMessage(sessionId: string, message: UnifiedMessage): Promise<UnifiedMessage> {
    const session = await this.getSessionEntity(sessionId);
    const count = await this.messageRepository.count({ where: { sessionId } });
    await this.messageRepository.save(
      this.messageRepository.create({
        messageId: message.uuid,
        sessionId,
        sequence: count + 1,
        role: message.role,
        timestamp: new Date(message.timestamp),
        payload: message,
      }),
    );
    await this.syncSessionAfterMessages(session, [...(await this.listMessages(sessionId))]);
    return message;
  }

  async upsertMessage(sessionId: string, message: UnifiedMessage): Promise<UnifiedMessage> {
    const session = await this.getSessionEntity(sessionId);
    const existing = await this.messageRepository.findOne({ where: { messageId: message.uuid } });
    if (existing) {
      const merged = mergeExistingMessage(existing.payload, message);
      existing.role = merged.role;
      existing.timestamp = new Date(merged.timestamp);
      existing.payload = merged;
      await this.messageRepository.save(existing);
    } else {
      const count = await this.messageRepository.count({ where: { sessionId } });
      await this.messageRepository.save(
        this.messageRepository.create({
          messageId: message.uuid,
          sessionId,
          sequence: count + 1,
          role: message.role,
          timestamp: new Date(message.timestamp),
          payload: message,
        }),
      );
    }
    await this.syncSessionAfterMessages(session, await this.listMessages(sessionId));
    return message;
  }

  async replaceMessages(sessionId: string, messages: UnifiedMessage[]): Promise<SessionRecord> {
    const session = await this.getSessionEntity(sessionId);
    await this.messageRepository.delete({ sessionId });
    const rows = messages.map((message, index) =>
      this.messageRepository.create({
        messageId: message.uuid,
        sessionId,
        sequence: index + 1,
        role: message.role,
        timestamp: new Date(message.timestamp),
        payload: message,
      }),
    );
    if (rows.length > 0) {
      await this.messageRepository.save(rows);
    }
    await this.syncSessionAfterMessages(session, messages, true);
    return toSessionRecord(session);
  }

  async findMessageIndex(sessionId: string, messageId: string): Promise<number> {
    const messages = await this.listMessages(sessionId);
    return messages.findIndex((message) => message.uuid === messageId);
  }

  async truncateMessages(sessionId: string, count: number): Promise<SessionRecord> {
    const messages = await this.listMessages(sessionId);
    const safeCount = Math.max(0, Math.min(count, messages.length));
    return this.replaceMessages(sessionId, messages.slice(0, safeCount));
  }

  async bindRunner(sessionId: string, runnerId: string, ownerUserId?: string): Promise<string> {
    const session = await this.getSessionEntity(sessionId, ownerUserId);
    session.boundRunnerId = runnerId;
    session.updatedAt = new Date();
    await this.sessionRepository.save(session);
    return runnerId;
  }

  async getBoundRunner(sessionId: string): Promise<string | undefined> {
    const session = await this.getSessionEntity(sessionId);
    return session.boundRunnerId ?? undefined;
  }

  async saveSession(session: SessionRecord): Promise<SessionRecord> {
    const entity = await this.getSessionEntity(session.sessionId);
    entity.title = session.title ?? null;
    entity.modelId = session.modelId;
    entity.mode = session.mode;
    entity.cwd = session.cwd;
    entity.messageCount = session.messageCount;
    entity.systemPrompt = session.systemPrompt ?? null;
    entity.latestCheckpointId = session.latestCheckpointId ?? null;
    entity.boundRunnerId = session.boundRunnerId ?? null;
    entity.specWorkflow = session.specWorkflow ?? null;
    entity.updatedAt = new Date(session.updatedAt);
    return toSessionRecord(await this.sessionRepository.save(entity));
  }

  private async getSessionEntity(sessionId: string, ownerUserId?: string): Promise<ChatSessionEntity> {
    const session = await this.sessionRepository.findOne({
      where: {
        sessionId,
        ...(ownerUserId ? { ownerUserId } : {}),
      },
    });
    if (!session) {
      throw new NotFoundError(`Session not found: ${sessionId}`);
    }
    return session;
  }

  private async syncSessionAfterMessages(
    session: ChatSessionEntity,
    messages: UnifiedMessage[],
    forceTitleSync = false,
  ): Promise<void> {
    session.messageCount = messages.length;
    session.updatedAt = new Date();
    session.latestCheckpointId = messages.at(-1)?.uuid ?? '';
    if (forceTitleSync || !session.title) {
      session.title = extractUserQueryTitle(messages) ?? null;
    }
    await this.sessionRepository.save(session);
    if (session.projectId) {
      await this.projectRepository.update({ projectId: session.projectId }, { updatedAt: new Date() });
    }
  }
}

function mergeExistingMessage(existing: UnifiedMessage, next: UnifiedMessage): UnifiedMessage {
  if (existing.type !== 'tool_execution' || next.type !== 'tool_execution') {
    return next;
  }

  return {
    ...existing,
    ...next,
    timestamp: existing.timestamp,
    updatedAt: next.updatedAt ?? next.timestamp,
    metadata: {
      ...existing.metadata,
      ...next.metadata,
      extensions: {
        ...(existing.metadata.extensions ?? {}),
        ...(next.metadata.extensions ?? {}),
      },
    },
    tool: mergeToolExecution(existing, next),
  };
}

function mergeToolExecution(
  existing: ToolExecutionMessage,
  next: ToolExecutionMessage,
): ToolExecutionMessage['tool'] {
  return {
    ...existing.tool,
    ...next.tool,
    input: next.tool.input ?? existing.tool.input,
    output: next.tool.output ?? existing.tool.output,
    error: next.tool.error ?? existing.tool.error ?? null,
  };
}

export function toSessionRecord(entity: ChatSessionEntity): SessionRecord {
  return {
    sessionId: entity.sessionId,
    ...(entity.projectId ? { projectId: entity.projectId } : {}),
    ...(entity.title ? { title: entity.title } : {}),
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
    modelId: entity.modelId,
    mode: entity.mode,
    cwd: entity.cwd,
    messageCount: entity.messageCount,
    ...(entity.systemPrompt ? { systemPrompt: entity.systemPrompt } : {}),
    latestCheckpointId: entity.latestCheckpointId ?? '',
    ...(entity.boundRunnerId ? { boundRunnerId: entity.boundRunnerId } : {}),
    ...(entity.specWorkflow ? { specWorkflow: entity.specWorkflow } : {}),
  };
}
