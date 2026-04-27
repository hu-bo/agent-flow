import { estimateItemsTokens } from '../token-estimator.js';
import type { CompactItem, CompactRequest, CompactResult, CompactStrategy } from '../types.js';

export class SemanticCompactStrategy implements CompactStrategy {
  readonly name = 'semantic' as const;

  async compact(request: CompactRequest): Promise<CompactResult> {
    if (request.items.length === 0) {
      return {
        strategy: this.name,
        items: [],
        summary: 'No input items.',
        estimatedTokens: 0,
        qualityScore: 0,
        didCompact: false,
      };
    }

    const targetCount = request.maxItems ?? Math.max(1, Math.floor(request.items.length * 0.5));
    const queryTerms = tokenize(request.query ?? '');

    const selected = [...request.items]
      .map((item) => ({
        item,
        score: relevanceScore(item.text, queryTerms) + (item.importance ?? 0) * 0.1,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, targetCount)
      .map(({ item }) => ({
        ...item,
        metadata: { ...item.metadata, compactedBy: this.name },
      }));

    return {
      strategy: this.name,
      items: selected,
      summary: `Selected top ${selected.length} semantically relevant items.`,
      estimatedTokens: estimateItemsTokens(selected),
      qualityScore: 0,
      didCompact: selected.length < request.items.length,
    };
  }
}

function relevanceScore(text: string, queryTerms: string[]): number {
  if (queryTerms.length === 0) {
    return 0;
  }

  const terms = new Set(tokenize(text));
  let overlap = 0;
  for (const term of queryTerms) {
    if (terms.has(term)) {
      overlap += 1;
    }
  }

  return overlap / queryTerms.length;
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^\p{L}\p{N}_-]+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 1);
}
