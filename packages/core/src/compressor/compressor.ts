import * as crypto from 'crypto';
import type { UnifiedMessage, ProviderAdapter, CompactBoundaryInfo } from '../messages/index.js';
import { COMPACT_SYSTEM_PROMPT } from './prompt.js';

export interface CompactionResult {
  messages: UnifiedMessage[];
  stats: {
    originalMessageCount: number;
    originalTokenCount: number;
    compactedTokenCount: number;
    summarizedMessageCount: number;
  };
}

/** Context compression engine */
export class ContextCompressor {
  constructor(private adapter: ProviderAdapter) {}

  async compact(
    messages: UnifiedMessage[],
    options?: { trigger?: 'auto' | 'manual' | 'model-switch'; targetTokens?: number },
  ): Promise<CompactionResult> {
    const trigger = options?.trigger ?? 'manual';

    // Serialize messages to text
    const serialized = messages
      .map(m => {
        const textParts = m.content
          .map(part => {
            switch (part.type) {
              case 'text': return part.text;
              case 'tool-call': return `[tool-call: ${part.toolName}(${JSON.stringify(part.input)})]`;
              case 'tool-result': return `[tool-result: ${part.toolName} => ${JSON.stringify(part.output)}]`;
              case 'image': return '[image]';
              case 'file': return `[file: ${part.mimeType}]`;
              default: return '';
            }
          })
          .join('\n');
        return `[${m.role}]: ${textParts}`;
      })
      .join('\n\n');

    // Estimate original token count
    const originalTokenCount = Math.ceil(serialized.length / 4);

    // Call the adapter to generate a summary
    const request = {
      system: COMPACT_SYSTEM_PROMPT,
      messages: [
        {
          uuid: crypto.randomUUID(),
          parentUuid: null,
          role: 'user' as const,
          content: [{ type: 'text' as const, text: serialized }],
          timestamp: new Date().toISOString(),
          metadata: {},
        },
      ],
    };

    const response = await this.adapter.chat(request);
    const summaryText = response.message.content
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map(p => p.text)
      .join('\n');

    const compactedTokenCount = Math.ceil(summaryText.length / 4);
    const lastMessage = messages[messages.length - 1];

    // Create boundary message
    const boundaryInfo: CompactBoundaryInfo = {
      trigger,
      preCompactTokenCount: originalTokenCount,
      postCompactTokenCount: compactedTokenCount,
      summarizedMessageCount: messages.length,
      lastPreCompactMessageUuid: lastMessage?.uuid ?? '',
    };

    const boundary: UnifiedMessage = {
      uuid: crypto.randomUUID(),
      parentUuid: lastMessage?.uuid ?? null,
      role: 'assistant',
      content: [{ type: 'text', text: '[context compacted]' }],
      timestamp: new Date().toISOString(),
      metadata: { compactBoundary: boundaryInfo },
    };

    // Create summary message
    const summary: UnifiedMessage = {
      uuid: crypto.randomUUID(),
      parentUuid: boundary.uuid,
      role: 'assistant',
      content: [{ type: 'text', text: summaryText }],
      timestamp: new Date().toISOString(),
      metadata: { isMeta: true },
    };

    return {
      messages: [boundary, summary],
      stats: {
        originalMessageCount: messages.length,
        originalTokenCount,
        compactedTokenCount,
        summarizedMessageCount: messages.length,
      },
    };
  }
}


