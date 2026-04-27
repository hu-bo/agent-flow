import { estimateItemsTokens } from './token-estimator.js';
import type { CompactItem, CompactQualityEvaluator } from './types.js';

export class DefaultCompactQualityEvaluator implements CompactQualityEvaluator {
  evaluate(before: CompactItem[], after: CompactItem[], tokenLimit: number): number {
    const beforeTokens = Math.max(estimateItemsTokens(before), 1);
    const afterTokens = Math.max(estimateItemsTokens(after), 1);

    const compressionScore = Math.max(0, 1 - afterTokens / beforeTokens);
    const coverageScore = keywordCoverage(before, after);
    const budgetScore = afterTokens <= tokenLimit ? 1 : Math.max(0, tokenLimit / afterTokens);

    return Number((coverageScore * 0.6 + compressionScore * 0.25 + budgetScore * 0.15).toFixed(4));
  }
}

function keywordCoverage(before: CompactItem[], after: CompactItem[]): number {
  const beforeWords = collectKeywords(before);
  if (beforeWords.size === 0) {
    return 1;
  }

  const afterWords = collectKeywords(after);
  let overlap = 0;
  for (const word of beforeWords) {
    if (afterWords.has(word)) {
      overlap += 1;
    }
  }

  return overlap / beforeWords.size;
}

function collectKeywords(items: CompactItem[]): Set<string> {
  const words = new Set<string>();
  for (const item of items) {
    for (const word of tokenize(item.text)) {
      words.add(word);
    }
  }
  return words;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}_-]+/u)
    .map((part) => part.trim())
    .filter((part) => part.length >= 3);
}
