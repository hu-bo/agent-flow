import type { RuntimeChatInput, RuntimeGateway } from '../contracts/api.js';
import { createTextMessage } from '../lib/messages.js';

export class MockRuntimeGateway implements RuntimeGateway {
  async *streamChat(input: RuntimeChatInput) {
    await delay(80);

    const attachmentNote = input.attachments.length
      ? `Received ${input.attachments.length} attachment(s) in this turn.`
      : '';
    const historyNote = input.history.length
      ? `Session history currently contains ${input.history.length} message(s).`
      : 'This is the first turn in the session.';

    yield createTextMessage('assistant', [
      'Fastify web-server scaffold is online.',
      `This response is currently produced by the mock runtime gateway, which is the seam for future integration with planner/executor orchestration and remote runners.`,
      `Model: ${input.modelId}.`,
      historyNote,
      attachmentNote,
      `Echo: ${input.message}`,
    ].filter(Boolean).join('\n\n'), {
      parentUuid: input.history.at(-1)?.uuid ?? null,
      metadata: {
        modelId: input.modelId,
        provider: 'mock-runtime',
        extensions: {
          requestId: input.requestId,
          reasoningEffort: input.reasoningEffort ?? 'medium',
        },
      },
    });
  }
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
