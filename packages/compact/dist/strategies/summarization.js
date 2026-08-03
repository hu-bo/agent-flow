import { estimateItemsTokens } from '../token-estimator.js';
export class SummarizationCompactStrategy {
    name = 'summarization';
    async compact(request) {
        const targetItems = request.maxItems ?? Math.max(1, Math.floor(request.items.length * 0.4));
        const sorted = [...request.items].sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0));
        const selected = sorted.slice(0, targetItems);
        const compactedItems = selected.map((item) => ({
            ...item,
            metadata: {
                ...item.metadata,
                compactedBy: this.name,
            },
            text: summarizeText(item.text),
        }));
        return {
            strategy: this.name,
            items: compactedItems,
            summary: `Summarized ${request.items.length} items into ${compactedItems.length} high-signal snippets.`,
            estimatedTokens: estimateItemsTokens(compactedItems),
            qualityScore: 0,
            didCompact: true,
        };
    }
}
function summarizeText(text) {
    const normalized = text.replace(/\s+/g, ' ').trim();
    if (normalized.length <= 200) {
        return normalized;
    }
    return `${normalized.slice(0, 197)}...`;
}
