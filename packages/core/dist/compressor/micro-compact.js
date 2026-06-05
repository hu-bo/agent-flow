export const DEFAULT_MICRO_COMPACT_CONFIG = {
    maxToolResultChars: 10000,
    headChars: 3000,
    tailChars: 3000,
    staleAfterTurns: 3,
};
export function microCompact(messages, currentTurn, config = DEFAULT_MICRO_COMPACT_CONFIG) {
    return messages.map((message, index) => {
        let modified = false;
        const newContent = message.content.map(part => {
            // Truncate large tool results
            if (part.type === 'tool-result') {
                const serialized = JSON.stringify(part.output);
                if (serialized.length > config.maxToolResultChars) {
                    modified = true;
                    const truncated = serialized.slice(0, config.headChars) +
                        '\n...[truncated]...\n' +
                        serialized.slice(-config.tailChars);
                    return { ...part, output: truncated };
                }
            }
            // Replace stale images with text placeholder
            if (part.type === 'image') {
                const turnsAgo = currentTurn - index;
                if (turnsAgo > config.staleAfterTurns) {
                    modified = true;
                    return { type: 'text', text: '[image removed]' };
                }
            }
            return part;
        });
        return modified ? { ...message, content: newContent } : message;
    });
}
//# sourceMappingURL=micro-compact.js.map