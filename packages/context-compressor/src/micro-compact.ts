import type { UnifiedMessage, ContentPart } from '@agent-flow/model-contracts';

export interface MicroCompactConfig {
  maxToolResultChars: number;  // default 10000
  headChars: number;           // default 3000
  tailChars: number;           // default 3000
  staleAfterTurns: number;     // default 3
}

export const DEFAULT_MICRO_COMPACT_CONFIG: MicroCompactConfig = {
  maxToolResultChars: 10000,
  headChars: 3000,
  tailChars: 3000,
  staleAfterTurns: 3,
};

export function microCompact(
  messages: UnifiedMessage[],
  currentTurn: number,
  config: MicroCompactConfig = DEFAULT_MICRO_COMPACT_CONFIG,
): UnifiedMessage[] {
  return messages.map((message, index) => {
    let modified = false;
    const newContent: ContentPart[] = message.content.map(part => {
      // Truncate large tool results
      if (part.type === 'tool-result') {
        const serialized = JSON.stringify(part.output);
        if (serialized.length > config.maxToolResultChars) {
          modified = true;
          const truncated =
            serialized.slice(0, config.headChars) +
            '\n...[truncated]...\n' +
            serialized.slice(-config.tailChars);
          return { ...part, output: truncated };
        }
      }

      // Replace stale images with text placeholder
      if (part.type === 'image') {
        const turnsAgo = currentTurn - index;
        if (turnsAgo > config.staleAfterTurns) {
          modified = true;
          return { type: 'text' as const, text: '[image removed]' };
        }
      }

      return part;
    });

    return modified ? { ...message, content: newContent } : message;
  });
}
