import { AutoCompactor, estimateItemsTokens, type CompactItem } from '@agent-flow/compact';
import type { UnifiedMessage } from '@agent-flow/core/messages';
import { createTextMessage } from '../lib/messages.js';
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
    strategy: string;
    qualityScore: number;
    didCompact: boolean;
  };
}

export class CompactService {
  constructor(
    private readonly sessionService: SessionService,
    private readonly compactor: AutoCompactor = new AutoCompactor(),
  ) {}

  async compactSession(
    sessionId?: string,
    trigger: 'auto' | 'manual' | 'model-switch' = 'manual',
  ): Promise<CompactSessionResult> {
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
          strategy: 'none',
          qualityScore: 1,
          didCompact: false,
        },
      };
    }

    const messages = this.sessionService.listMessages(targetSession.sessionId);
    if (messages.length <= 6) {
      const baselineTokens = estimateItemsTokens(toCompactItems(messages));
      return {
        sessionId: targetSession.sessionId,
        stats: {
          trigger,
          beforeMessageCount: messages.length,
          afterMessageCount: messages.length,
          removedMessageCount: 0,
          beforeTokenEstimate: baselineTokens,
          afterTokenEstimate: baselineTokens,
          strategy: 'none',
          qualityScore: 1,
          didCompact: false,
        },
      };
    }

    const preservedTail = messages.slice(-4);
    const compactedHead = messages.slice(0, -4);
    const compactItems = toCompactItems(compactedHead);
    const beforeTokenEstimate = estimateItemsTokens(toCompactItems(messages));
    const headTokenEstimate = estimateItemsTokens(compactItems);
    const tokenLimit = Math.max(120, Math.floor(headTokenEstimate * 0.45));
    const query = findLatestUserPrompt(messages);
    const compactResult = await this.compactor.compact({
      items: compactItems,
      tokenLimit,
      maxItems: 4,
      query,
    });

    if (!compactResult.didCompact) {
      return {
        sessionId: targetSession.sessionId,
        stats: {
          trigger,
          beforeMessageCount: messages.length,
          afterMessageCount: messages.length,
          removedMessageCount: 0,
          beforeTokenEstimate,
          afterTokenEstimate: beforeTokenEstimate,
          strategy: compactResult.strategy,
          qualityScore: compactResult.qualityScore,
          didCompact: false,
        },
      };
    }

    const summaryBody = compactResult.items
      .map((item, index) => `${index + 1}. ${item.text}`)
      .join('\n');
    const summaryMessage = createTextMessage(
      'assistant',
      `Context summary (${trigger}, strategy=${compactResult.strategy}):\n${compactResult.summary}\n\n${summaryBody}`,
      {
        parentUuid: null,
        metadata: {
          isMeta: true,
          compactBoundary: {
            trigger,
            preCompactTokenCount: beforeTokenEstimate,
            postCompactTokenCount: compactResult.estimatedTokens + estimateItemsTokens(toCompactItems(preservedTail)),
            summarizedMessageCount: compactedHead.length,
            lastPreCompactMessageUuid: compactedHead.at(-1)?.uuid ?? '',
          },
          extensions: {
            compactQualityScore: compactResult.qualityScore,
            compactStrategy: compactResult.strategy,
          },
        },
      },
    );

    const nextMessages = [summaryMessage, ...preservedTail];
    this.sessionService.replaceMessages(targetSession.sessionId, nextMessages);
    const afterTokenEstimate = estimateItemsTokens(toCompactItems(nextMessages));

    return {
      sessionId: targetSession.sessionId,
      stats: {
        trigger,
        beforeMessageCount: messages.length,
        afterMessageCount: nextMessages.length,
        removedMessageCount: messages.length - nextMessages.length,
        beforeTokenEstimate,
        afterTokenEstimate,
        strategy: compactResult.strategy,
        qualityScore: compactResult.qualityScore,
        didCompact: true,
      },
    };
  }
}

function toCompactItems(messages: UnifiedMessage[]): CompactItem[] {
  return messages.map((message, index) => ({
    id: message.uuid,
    text: toMessageText(message),
    importance: computeImportance(message.role, index, messages.length),
    metadata: {
      role: message.role,
      timestamp: message.timestamp,
    },
  }));
}

function computeImportance(role: UnifiedMessage['role'], index: number, size: number): number {
  const recencyWeight = size > 1 ? index / (size - 1) : 1;
  if (role === 'system') return 1;
  if (role === 'user') return 0.8 + recencyWeight * 0.2;
  if (role === 'assistant') return 0.6 + recencyWeight * 0.25;
  return 0.5 + recencyWeight * 0.2;
}

function toMessageText(message: UnifiedMessage): string {
  const partText = message.content
    .map((part) => {
      if (part.type === 'text') return part.text;
      if (part.type === 'tool-call') return `[tool-call:${part.toolName}]`;
      if (part.type === 'tool-result') return `[tool-result:${part.toolName}]`;
      if (part.type === 'file') return `[file:${part.mimeType}]`;
      if (part.type === 'image') return '[image]';
      return '';
    })
    .filter(Boolean)
    .join(' ');
  return `${message.role}: ${partText}`.trim();
}

function findLatestUserPrompt(messages: UnifiedMessage[]): string | undefined {
  const latestUser = [...messages].reverse().find((message) => message.role === 'user');
  if (!latestUser) {
    return undefined;
  }
  return latestUser.content
    .map((part) => (part.type === 'text' ? part.text : ''))
    .filter(Boolean)
    .join(' ')
    .trim();
}
