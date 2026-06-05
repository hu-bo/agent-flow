import type { TokenUsage, UnifiedMessage } from '../messages/index.js';
export interface SessionMetadata {
    sessionId: string;
    userId: string;
    title: string;
    modelId: string;
    messageCount: number;
    tokenUsage: TokenUsage;
    createdAt: string;
    updatedAt: string;
    lastDeviceId: string;
    storageRef: string;
    compactBoundaryUuid: string | null;
}
export interface RemoteSessionManager {
    create(userId: string, modelId: string): Promise<SessionMetadata>;
    load(sessionId: string): Promise<{
        metadata: SessionMetadata;
        messages: UnifiedMessage[];
    }>;
    appendMessages(sessionId: string, messages: UnifiedMessage[]): Promise<void>;
    updateMetadata(sessionId: string, updates: Partial<SessionMetadata>): Promise<void>;
    listByUser(userId: string, limit?: number, offset?: number): Promise<SessionMetadata[]>;
    delete(sessionId: string): Promise<void>;
}
interface FileRemoteSessionManagerOptions {
    basePath: string;
}
/** Local file-backed implementation that mimics remote session persistence APIs. */
export declare class FileRemoteSessionManager implements RemoteSessionManager {
    private readonly sessionsRoot;
    constructor(options: FileRemoteSessionManagerOptions);
    create(userId: string, modelId: string): Promise<SessionMetadata>;
    load(sessionId: string): Promise<{
        metadata: SessionMetadata;
        messages: UnifiedMessage[];
    }>;
    appendMessages(sessionId: string, messages: UnifiedMessage[]): Promise<void>;
    updateMetadata(sessionId: string, updates: Partial<SessionMetadata>): Promise<void>;
    listByUser(userId: string, limit?: number, offset?: number): Promise<SessionMetadata[]>;
    delete(sessionId: string): Promise<void>;
    listMessages(sessionId: string, options?: {
        afterUuid?: string;
        limit?: number;
    }): Promise<UnifiedMessage[]>;
    writeCompactedMessages(sessionId: string, allMessages: UnifiedMessage[], compactBoundaryUuid: string | null): Promise<void>;
    private sessionDir;
    private metadataPath;
    private messagesPath;
    private compactMessagesPath;
    private ensureSessionDir;
    private readMetadata;
    private writeMetadata;
    private readMessages;
    private exists;
}
export {};
//# sourceMappingURL=remote-session-manager.d.ts.map