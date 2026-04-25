import { createTextMessage, summarizeMessages } from '../lib/messages.js';
import { SessionService } from './session-service.js';

export interface CompactSessionResult {
  sessionId: string | null;
  stats: {
    trigger: 'auto' | 'manual' | 'model-switch';
    beforeMessageCount: number;
    afterMessageCount: number;
    removedMessageCount: number;
    beforeTokenEstimate: number;
    afterTokenEstimate: number;
  };
}

export class CompactService {
  constructor(private readonly sessionService: SessionService) {}

  compactSession(sessionId?: string, trigger: 'auto' | 'manual' | 'model-switch' = 'manual') {
    const targetSession = sessionId
      ? this.sessionService.getSession(sessionId)
      : this.sessionService.getLatestSession();

    if (!targetSession) {
      return {
        sessionId: null,
        stats: {
          trigger,
          beforeMessageCount: 0,
          afterMessageCount: 0,
          removedMessageCount: 0,
          beforeTokenEstimate: 0,
          afterTokenEstimate: 0,
        },
      } satisfies CompactSessionResult;
    }

    const messages = this.sessionService.listMessages(targetSession.sessionId);
    const beforeTokenEstimate = estimateTokens(messages);

    if (messages.length <= 6) {
      return {
        sessionId: targetSession.sessionId,
        stats: {
          trigger,
          beforeMessageCount: messages.length,
          afterMessageCount: messages.length,
          removedMessageCount: 0,
          beforeTokenEstimate,
          afterTokenEstimate: beforeTokenEstimate,
        },
      } satisfies CompactSessionResult;
    }

    const preservedTail = messages.slice(-4);
    const compactedHead = messages.slice(0, -4);
    const summaryMessage = createTextMessage(
      'assistant',
      `Context summary (${trigger}):\n${summarizeMessages(compactedHead)}`,
      {
        parentUuid: null,
        metadata: {
          isMeta: true,
          compactBoundary: {
            trigger,
            preCompactTokenCount: beforeTokenEstimate,
            postCompactTokenCount: estimateTokens(preservedTail),
            summarizedMessageCount: compactedHead.length,
            lastPreCompactMessageUuid: compactedHead.at(-1)?.uuid ?? '',
          },
        },
      },
    );

    const nextMessages = [summaryMessage, ...preservedTail];
    this.sessionService.replaceMessages(targetSession.sessionId, nextMessages);

    return {
      sessionId: targetSession.sessionId,
      stats: {
        trigger,
        beforeMessageCount: messages.length,
        afterMessageCount: nextMessages.length,
        removedMessageCount: messages.length - nextMessages.length,
        beforeTokenEstimate,
        afterTokenEstimate: estimateTokens(nextMessages),
      },
    } satisfies CompactSessionResult;
  }
}

function estimateTokens(messages: { content: Array<{ type: string; text?: string }> }[]) {
  const text = messages
    .flatMap((message) =>
      message.content.map((part) => (part.type === 'text' ? part.text ?? '' : `[${part.type}]`)),
    )
    .join(' ');

  return Math.ceil(text.length / 4);
}
