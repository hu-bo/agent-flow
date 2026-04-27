import type { CompactItem } from './types.js';

export function estimateTextTokens(text: string): number {
  if (text.length === 0) {
    return 0;
  }
  return Math.ceil(text.length / 4);
}

export function estimateItemsTokens(items: CompactItem[]): number {
  return items.reduce((total, item) => total + estimateTextTokens(item.text), 0);
}
