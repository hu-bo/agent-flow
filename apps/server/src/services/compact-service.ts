import { ContextCompressor } from '@agent-flow/core/compressor';
import type { ServerRuntime } from '../runtime.js';
import { HttpError } from '../errors.js';
import type { SessionPrincipal } from './session-service.js';
import { loadSession, writeCompactedMessages } from './session-service.js';

export interface CompactInput {
  sessionId: string;
  principal: SessionPrincipal;
  trigger?: 'manual' | 'auto';
}

export async function compactSession(
  runtime: ServerRuntime,
  input: CompactInput,
): Promise<{ sessionId: string; stats: unknown }> {
  const session = await loadSession(runtime, input.principal, input.sessionId);
  if (!session.messages.length) {
    throw new HttpError(400, 'Session has no messages to compact', 'EMPTY_SESSION');
  }

  const adapter = runtime.config.gateway.getAdapter();
  const compressor = new ContextCompressor(adapter);
  const result = await compressor.compact(session.messages, {
    trigger: input.trigger ?? 'manual',
  });

  const compactBoundaryUuid =
    result.messages.find((msg) => !!msg.metadata.compactBoundary)?.uuid ?? null;
  const allMessages = [...session.messages, ...result.messages];
  await writeCompactedMessages(
    runtime,
    input.principal,
    input.sessionId,
    allMessages,
    compactBoundaryUuid,
  );

  return {
    sessionId: input.sessionId,
    stats: result.stats,
  };
}


