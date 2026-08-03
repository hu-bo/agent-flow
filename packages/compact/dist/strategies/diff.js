import { estimateItemsTokens } from '../token-estimator.js';
export class DiffCompactStrategy {
    name = 'diff';
    async compact(request) {
        if (request.items.length <= 1) {
            return {
                strategy: this.name,
                items: request.items.map((item) => ({ ...item })),
                summary: 'Only one item present; diff compaction skipped.',
                estimatedTokens: estimateItemsTokens(request.items),
                qualityScore: 0,
                didCompact: false,
            };
        }
        const compacted = [];
        for (let i = 0; i < request.items.length; i += 1) {
            const current = request.items[i];
            if (i === 0) {
                compacted.push({
                    ...current,
                    text: trimText(current.text),
                    metadata: { ...current.metadata, compactedBy: this.name, baseline: true },
                });
                continue;
            }
            const previous = request.items[i - 1];
            const delta = buildLineDiff(previous.text, current.text);
            compacted.push({
                ...current,
                text: delta,
                metadata: { ...current.metadata, compactedBy: this.name, comparedWith: previous.id },
            });
        }
        return {
            strategy: this.name,
            items: compacted,
            summary: `Calculated ${Math.max(0, compacted.length - 1)} delta blocks.`,
            estimatedTokens: estimateItemsTokens(compacted),
            qualityScore: 0,
            didCompact: true,
        };
    }
}
function buildLineDiff(before, after) {
    const beforeSet = new Set(splitLines(before));
    const afterSet = splitLines(after);
    const added = [];
    const removed = [];
    for (const line of afterSet) {
        if (!beforeSet.has(line)) {
            added.push(`+ ${line}`);
        }
    }
    const afterLookup = new Set(afterSet);
    for (const line of beforeSet) {
        if (!afterLookup.has(line)) {
            removed.push(`- ${line}`);
        }
    }
    const output = [...added, ...removed].join('\n').trim();
    return output.length > 0 ? output : '[no meaningful delta]';
}
function splitLines(text) {
    return text
        .split(/\r?\n/g)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
}
function trimText(text) {
    const normalized = text.trim();
    return normalized.length > 220 ? `${normalized.slice(0, 217)}...` : normalized;
}
