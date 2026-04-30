import { randomUUID } from 'node:crypto';
import type { UnifiedMessage } from '@agent-flow/core/messages';
import type { SessionRecord, SessionState } from '../contracts/api.js';
import { NotFoundError } from '../lib/errors.js';

interface CreateSessionInput {
  modelId: string;
  cwd: string;
  systemPrompt?: string;
}

export class SessionService {
  private readonly sessions = new Map<string, SessionState>();
  private readonly runnerBindings = new Map<string, string>();

  constructor(private readonly defaultCwd: string) {}

  listSessions() {
    return Array.from(this.sessions.values())
      .map((state) => state.session)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  createSession(input: Partial<CreateSessionInput> & Pick<CreateSessionInput, 'modelId'>) {
    const now = new Date().toISOString();
    const session: SessionRecord = {
      sessionId: randomUUID(),
      createdAt: now,
      updatedAt: now,
      modelId: input.modelId,
      cwd: input.cwd ?? this.defaultCwd,
      messageCount: 0,
      systemPrompt: input.systemPrompt,
      latestCheckpointId: '',
    };

    const state: SessionState = {
      session,
      messages: [],
    };

    this.sessions.set(session.sessionId, state);
    return session;
  }

  getSessionState(sessionId: string) {
    const state = this.sessions.get(sessionId);
    if (!state) {
      throw new NotFoundError(`Session not found: ${sessionId}`);
    }
    return state;
  }

  getSession(sessionId: string) {
    return this.getSessionState(sessionId).session;
  }

  getLatestSession() {
    return this.listSessions()[0];
  }

  deleteSession(sessionId: string) {
    if (!this.sessions.delete(sessionId)) {
      throw new NotFoundError(`Session not found: ${sessionId}`);
    }
    this.runnerBindings.delete(sessionId);
  }

  updateSessionModel(sessionId: string, modelId: string) {
    const state = this.getSessionState(sessionId);
    state.session.modelId = modelId;
    state.session.updatedAt = new Date().toISOString();
    return state.session;
  }

  listMessages(sessionId: string) {
    return [...this.getSessionState(sessionId).messages];
  }

  appendMessage(sessionId: string, message: UnifiedMessage) {
    const state = this.getSessionState(sessionId);
    state.messages.push(message);
    state.session.messageCount = state.messages.length;
    state.session.updatedAt = message.timestamp;
    state.session.latestCheckpointId = message.uuid;
    return message;
  }

  replaceMessages(sessionId: string, messages: UnifiedMessage[]) {
    const state = this.getSessionState(sessionId);
    state.messages = [...messages];
    state.session.messageCount = state.messages.length;
    state.session.updatedAt = new Date().toISOString();
    state.session.latestCheckpointId = state.messages.at(-1)?.uuid ?? '';
    return state.session;
  }

  bindRunner(sessionId: string, runnerId: string) {
    this.getSession(sessionId);
    this.runnerBindings.set(sessionId, runnerId);
    return runnerId;
  }

  getBoundRunner(sessionId: string): string | undefined {
    this.getSession(sessionId);
    return this.runnerBindings.get(sessionId);
  }
}
