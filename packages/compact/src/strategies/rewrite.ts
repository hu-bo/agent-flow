import { estimateItemsTokens } from '../token-estimator.js';
import type { CompactItem, CompactRequest, CompactResult, CompactStrategy } from '../types.js';

export class RewriteCompactStrategy implements CompactStrategy {
  readonly name = 'rewrite' as const;

  async compact(request: CompactRequest): Promise<CompactResult> {
    const compacted = request.items.map((item) => ({
      ...item,
      metadata: { ...item.metadata, compactedBy: this.name },
      text: rewriteText(item.text),
    }));

    return {
      strategy: this.name,
      items: compacted,
      summary: `Rewrote ${compacted.length} items by de-duplicating and normalizing text.`,
      estimatedTokens: estimateItemsTokens(compacted),
      qualityScore: 0,
      didCompact: true,
    };
  }
}

function rewriteText(input: string): string {
  const sentences = input
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?;])\s+/g)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const sentence of sentences) {
    const key = sentence.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(sentence);
  }

  const rewritten = deduped.join(' ');
  return rewritten.length > 240 ? `${rewritten.slice(0, 237)}...` : rewritten;
}
