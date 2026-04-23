import type { UnifiedMessage } from '@agent-flow/model-contracts';
import { HttpError } from '../errors.js';
import type { ServerRuntime } from '../runtime.js';

type SessionInfo = ReturnType<ServerRuntime['sessionManager']['createSession']>;

function isNotFoundError(error: unknown): boolean {
  return (
    error instanceof Error &&
    'code' in error &&
    (error as NodeJS.ErrnoException).code === 'ENOENT'
  );
}

export function listSessions(runtime: ServerRuntime): SessionInfo[] {
  return runtime.sessionManager.listSessions();
}

export function createSession(
  runtime: ServerRuntime,
  input: { modelId?: string; systemPrompt?: string },
): SessionInfo {
  return runtime.sessionManager.createSession({
    modelId: input.modelId ?? runtime.config.gateway.resolveModel(),
    cwd: process.cwd(),
    systemPrompt: input.systemPrompt,
  });
}

export function deleteSession(runtime: ServerRuntime, sessionId: string): void {
  runtime.sessionManager.deleteSession(sessionId);
}

export function loadSession(runtime: ServerRuntime, sessionId: string): {
  info: SessionInfo;
  messages: UnifiedMessage[];
} {
  try {
    return runtime.sessionManager.loadSession(sessionId);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new HttpError(404, 'Session not found', 'SESSION_NOT_FOUND');
    }
    throw error;
  }
}

export function appendSessionMessage(
  runtime: ServerRuntime,
  sessionId: string,
  message: UnifiedMessage,
  cwd: string,
): void {
  try {
    runtime.sessionManager.appendMessage(sessionId, message, cwd);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new HttpError(404, 'Session not found', 'SESSION_NOT_FOUND');
    }
    throw error;
  }
}
