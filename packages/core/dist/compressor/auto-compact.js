export const DEFAULT_AUTO_COMPACT_CONFIG = {
    triggerRatio: 0.7,
    targetRatio: 0.5,
    minMessageCount: 10,
    maxRetries: 3,
};
export function shouldAutoCompact(messages, currentTokenCount, modelCapabilities, config = DEFAULT_AUTO_COMPACT_CONFIG) {
    return (currentTokenCount / modelCapabilities.maxInputTokens > config.triggerRatio &&
        messages.length >= config.minMessageCount);
}
//# sourceMappingURL=auto-compact.js.map