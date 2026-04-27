import type { ContextEnvelope, ContextFragment, TokenWindowManager } from '../../types/index.js';

export class FixedTokenWindowManager implements TokenWindowManager {
  apply(fragments: ContextFragment[], maxTokens: number): ContextEnvelope {
    const selected: ContextFragment[] = [];
    let used = 0;
    let truncated = false;

    for (const fragment of fragments) {
      if (used + fragment.tokenEstimate > maxTokens) {
        truncated = true;
        continue;
      }
      selected.push(fragment);
      used += fragment.tokenEstimate;
    }

    return {
      fragments: selected,
      tokenBudget: maxTokens,
      tokenUsed: used,
      truncated
    };
  }
}
