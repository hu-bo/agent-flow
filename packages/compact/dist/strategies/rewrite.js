import { estimateItemsTokens } from '../token-estimator.js';
export class RewriteCompactStrategy {
    name = 'rewrite';
    async compact(request) {
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
function rewriteText(input) {
    const sentences = input
        .replace(/\s+/g, ' ')
        .split(/(?<=[.!?;])\s+/g)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    const deduped = [];
    const seen = new Set();
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
//# sourceMappingURL=rewrite.js.map