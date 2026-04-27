import type { AgentRunRequest, ContextFragment, ContextSelector } from '../../types/index.js';

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-zA-Z0-9_]+/)
      .filter((token) => token.length > 0)
  );
}

function overlapScore(goalTokens: Set<string>, content: string): number {
  const tokens = tokenize(content);
  let hits = 0;
  for (const token of tokens) {
    if (goalTokens.has(token)) {
      hits += 1;
    }
  }
  return hits;
}

export class KeywordContextSelector implements ContextSelector {
  constructor(private readonly maxFragments = 32) {}

  async select(fragments: ContextFragment[], request: AgentRunRequest): Promise<ContextFragment[]> {
    const goalTokens = tokenize(request.goal);
    const sorted = [...fragments].sort((a, b) => {
      const scoreA = overlapScore(goalTokens, a.content) + a.priority;
      const scoreB = overlapScore(goalTokens, b.content) + b.priority;
      return scoreB - scoreA;
    });

    return sorted.slice(0, this.maxFragments);
  }
}
