export class FixedTokenWindowManager {
    apply(fragments, maxTokens) {
        const selected = [];
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
//# sourceMappingURL=index.js.map