function tokenize(text) {
    return new Set(text
        .toLowerCase()
        .split(/[^a-zA-Z0-9_]+/)
        .filter((token) => token.length > 0));
}
function overlapScore(goalTokens, content) {
    const tokens = tokenize(content);
    let hits = 0;
    for (const token of tokens) {
        if (goalTokens.has(token)) {
            hits += 1;
        }
    }
    return hits;
}
export class KeywordContextSelector {
    maxFragments;
    constructor(maxFragments = 32) {
        this.maxFragments = maxFragments;
    }
    async select(fragments, request) {
        const goalTokens = tokenize(request.goal);
        const sorted = [...fragments].sort((a, b) => {
            const scoreA = overlapScore(goalTokens, a.content) + a.priority;
            const scoreB = overlapScore(goalTokens, b.content) + b.priority;
            return scoreB - scoreA;
        });
        return sorted.slice(0, this.maxFragments);
    }
}
//# sourceMappingURL=index.js.map