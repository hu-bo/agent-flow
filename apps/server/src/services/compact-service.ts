import { ContextCompressor } from '@agent-flow/context-compressor';
import type { ServerRuntime } from '../runtime.js';
import { HttpError } from '../errors.js';
import { appendSessionMessage, loadSession } from './session-service.js';

export interface CompactInput {
  sessionId: string;
  trigger?: 'manual' | 'auto';
}

export async function compactSession(
  runtime: ServerRuntime,
  input: CompactInput,
): Promise<{ sessionId: string; stats: unknown }> {
  const session = loadSession(runtime, input.sessionId);
  if (!session.messages.length) {
    throw new HttpError(400, 'Session has no messages to compact', 'EMPTY_SESSION');
  }

  const adapter = runtime.config.gateway.getAdapter();
  const compressor = new ContextCompressor(adapter);
  const result = await compressor.compact(session.messages, {
    trigger: input.trigger ?? 'manual',
  });

  for (const msg of result.messages) {
    appendSessionMessage(runtime, input.sessionId, msg, session.info.cwd);
  }

  return {
    sessionId: input.sessionId,
    stats: result.stats,
  };
}

