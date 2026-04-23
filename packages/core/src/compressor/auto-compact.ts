import type { UnifiedMessage, ModelCapabilities } from '../messages/index.js';

export interface AutoCompactConfig {
  triggerRatio: number;       // default 0.7
  targetRatio: number;        // default 0.5
  minMessageCount: number;    // default 10
  maxRetries: number;         // default 3
}

export const DEFAULT_AUTO_COMPACT_CONFIG: AutoCompactConfig = {
  triggerRatio: 0.7,
  targetRatio: 0.5,
  minMessageCount: 10,
  maxRetries: 3,
};

export function shouldAutoCompact(
  messages: UnifiedMessage[],
  currentTokenCount: number,
  modelCapabilities: ModelCapabilities,
  config: AutoCompactConfig = DEFAULT_AUTO_COMPACT_CONFIG,
): boolean {
  return (
    currentTokenCount / modelCapabilities.maxInputTokens > config.triggerRatio &&
    messages.length >= config.minMessageCount
  );
}

