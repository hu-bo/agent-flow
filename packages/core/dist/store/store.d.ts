import type { UnifiedMessage } from '../messages/index.js';
/** Core context store �?manages message history for a session */
export declare class ContextStore {
    private messages;
    getMessages(): UnifiedMessage[];
    getMessagesAfterCompactBoundary(): UnifiedMessage[];
    appendMessage(message: UnifiedMessage): void;
    appendMessages(messages: UnifiedMessage[]): void;
    insertCompactBoundary(boundary: UnifiedMessage, summary: UnifiedMessage): void;
    stripImageContent(): void;
    estimateTokenCount(): Promise<number>;
    private findLastCompactBoundaryIndex;
}
//# sourceMappingURL=store.d.ts.map