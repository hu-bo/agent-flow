import type { UnifiedMessage } from '@agent-flow/core/messages';
import type { ServerRuntime } from '../runtime.js';
import { createAgent } from './agent-factory.js';
import type { SessionPrincipal } from './session-service.js';
import { appendSessionMessage, loadSession } from './session-service.js';

export interface ChatRequestInput {
  message: string;
  model?: string;
  reasoningEffort?: 'low' | 'medium' | 'high';
  sessionId?: string;
  principal?: SessionPrincipal;
}

export async function *runChat(
  runtime: ServerRuntime,
  input: ChatRequestInput,
): AsyncGenerator<UnifiedMessage> {
  let seedMessages: UnifiedMessage[] | undefined;
  const principal = input.principal;

  if (input.sessionId) {
    if (!principal) {
      throw new Error('principal is required when sessionId is provided');
    }
    const session = await loadSession(runtime, principal, input.sessionId);
    seedMessages = session.messages;
  }

  const { agent } = createAgent(runtime, {
    model: input.model,
    reasoningEffort: input.reasoningEffort,
    seedMessages,
  });

  for await (const msg of agent.run(input.message)) {
    if (input.sessionId) {
      if (!principal) {
        throw new Error('principal is required when sessionId is provided');
      }
      // Persistence errors should surface as API errors when sessionId is explicit.
      await appendSessionMessage(runtime, principal, input.sessionId, msg);
    }
    yield msg;
  }
}

