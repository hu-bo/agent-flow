export function estimateTextTokens(text) {
    if (text.length === 0) {
        return 0;
    }
    return Math.ceil(text.length / 4);
}
export function estimateItemsTokens(items) {
    return items.reduce((total, item) => total + estimateTextTokens(item.text), 0);
}
//# sourceMappingURL=token-estimator.js.map