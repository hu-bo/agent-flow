import type { UnifiedMessage } from '@agent-flow/model-contracts';
import type { ServerRuntime } from '../runtime.js';
import { createAgent } from './agent-factory.js';
import { appendSessionMessage, loadSession } from './session-service.js';

export interface ChatRequestInput {
  message: string;
  model?: string;
  reasoningEffort?: 'low' | 'medium' | 'high';
  sessionId?: string;
}

export async function *runChat(
  runtime: ServerRuntime,
  input: ChatRequestInput,
): AsyncGenerator<UnifiedMessage> {
  let seedMessages: UnifiedMessage[] | undefined;
  let sessionCwd = process.cwd();

  if (input.sessionId) {
    const session = loadSession(runtime, input.sessionId);
    seedMessages = session.messages;
    sessionCwd = session.info.cwd;
  }

  const { agent } = createAgent(runtime, {
    model: input.model,
    reasoningEffort: input.reasoningEffort,
    seedMessages,
  });

  for await (const msg of agent.run(input.message)) {
    if (input.sessionId) {
      // Persistence errors should surface as API errors when sessionId is explicit.
      appendSessionMessage(runtime, input.sessionId, msg, sessionCwd);
    }
    yield msg;
  }
}
