import type { UnifiedMessage } from '../messages/index.js';
export interface SessionInfo {
    sessionId: string;
    createdAt: string;
    updatedAt: string;
    modelId: string;
    cwd: string;
    messageCount: number;
    systemPrompt?: string;
}
export declare class SessionManager {
    private basePath;
    private serializer;
    constructor(basePath: string);
    createSession(config: {
        modelId: string;
        cwd: string;
        systemPrompt?: string;
    }): SessionInfo;
    loadSession(sessionId: string): {
        info: SessionInfo;
        messages: UnifiedMessage[];
    };
    listSessions(): SessionInfo[];
    deleteSession(sessionId: string): void;
    appendMessage(sessionId: string, message: UnifiedMessage, cwd: string): void;
}
//# sourceMappingURL=session.d.ts.map