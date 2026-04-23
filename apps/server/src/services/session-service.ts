import type { SessionMetadata, UnifiedMessage } from '@agent-flow/core';
import { HttpError } from '../errors.js';
import type { ServerRuntime } from '../runtime.js';

export interface SessionPrincipal {
  userId: string;
  deviceId: string;
}

export interface SessionListInput {
  userId: string;
  limit?: number;
  offset?: number;
}

export interface SessionMessagesInput {
  sessionId: string;
  principal: SessionPrincipal;
  afterUuid?: string;
  limit?: number;
}

function isNotFoundError(error: unknown): boolean {
  return (
    error instanceof Error &&
    'code' in error &&
    (error as NodeJS.ErrnoException).code === 'ENOENT'
  );
}

export async function listSessions(
  runtime: ServerRuntime,
  input: SessionListInput,
): Promise<SessionMetadata[]> {
  return runtime.remoteSessionManager.listByUser(input.userId, input.limit, input.offset);
}

export async function createSession(
  runtime: ServerRuntime,
  input: { principal: SessionPrincipal; modelId?: string; title?: string; systemPrompt?: string },
): Promise<SessionMetadata> {
  const metadata = await runtime.remoteSessionManager.create(
    input.principal.userId,
    input.modelId ?? runtime.config.gateway.resolveModel(),
  );
  await runtime.remoteSessionManager.updateMetadata(metadata.sessionId, {
    title: input.title ?? input.systemPrompt ?? '',
    lastDeviceId: input.principal.deviceId,
  });
  const { metadata: updated } = await runtime.remoteSessionManager.load(metadata.sessionId);
  return updated;
}

export async function deleteSession(
  runtime: ServerRuntime,
  principal: SessionPrincipal,
  sessionId: string,
): Promise<void> {
  await ensureSessionOwner(runtime, principal.userId, sessionId);
  await runtime.remoteSessionManager.delete(sessionId);
}

export async function loadSession(
  runtime: ServerRuntime,
  principal: SessionPrincipal,
  sessionId: string,
): Promise<{
  metadata: SessionMetadata;
  messages: UnifiedMessage[];
}> {
  const session = await loadRawSession(runtime, sessionId);
  if (session.metadata.userId !== principal.userId) {
    throw new HttpError(404, 'Session not found', 'SESSION_NOT_FOUND');
  }
  return session;
}

export async function listSessionMessages(
  runtime: ServerRuntime,
  input: SessionMessagesInput,
): Promise<UnifiedMessage[]> {
  await ensureSessionOwner(runtime, input.principal.userId, input.sessionId);
  return runtime.remoteSessionManager.listMessages(input.sessionId, {
    afterUuid: input.afterUuid,
    limit: input.limit,
  });
}

export async function appendSessionMessage(
  runtime: ServerRuntime,
  principal: SessionPrincipal,
  sessionId: string,
  message: UnifiedMessage,
): Promise<void> {
  await ensureSessionOwner(runtime, principal.userId, sessionId);
  await runtime.remoteSessionManager.appendMessages(sessionId, [message]);
  await runtime.remoteSessionManager.updateMetadata(sessionId, {
    lastDeviceId: principal.deviceId,
  });
}

export async function writeCompactedMessages(
  runtime: ServerRuntime,
  principal: SessionPrincipal,
  sessionId: string,
  allMessages: UnifiedMessage[],
  compactBoundaryUuid: string | null,
): Promise<void> {
  await ensureSessionOwner(runtime, principal.userId, sessionId);
  await runtime.remoteSessionManager.writeCompactedMessages(
    sessionId,
    allMessages,
    compactBoundaryUuid,
  );
}

async function ensureSessionOwner(
  runtime: ServerRuntime,
  userId: string,
  sessionId: string,
): Promise<void> {
  const session = await loadRawSession(runtime, sessionId);
  if (session.metadata.userId !== userId) {
    throw new HttpError(404, 'Session not found', 'SESSION_NOT_FOUND');
  }
}

async function loadRawSession(
  runtime: ServerRuntime,
  sessionId: string,
): Promise<{ metadata: SessionMetadata; messages: UnifiedMessage[] }> {
  try {
    return await runtime.remoteSessionManager.load(sessionId);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new HttpError(404, 'Session not found', 'SESSION_NOT_FOUND');
    }
    throw error;
  }
}

