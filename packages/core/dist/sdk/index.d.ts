import type { UnifiedMessage, ToolDefinition, ProviderAdapter } from '../messages/index.js';
import { ModelGateway } from '../gateway/index.js';
import { SessionManager } from '../store/index.js';
import type { CompactionResult } from '../compressor/index.js';
import { ToolRegistry } from '../tool-registry.js';
import type { ToolExecutor } from '../tool-registry.js';
export interface AgentFlowConfig {
    defaultModel: string;
    systemPrompt?: string;
    sessionDir?: string;
    checkpointDir?: string;
    maxTurns?: number;
}
export declare class AgentFlow {
    private gateway;
    private contextStore;
    private sessionManager;
    private checkpointManager;
    private toolRegistry;
    private permissionManager;
    private config;
    constructor(config: AgentFlowConfig);
    registerAdapter(modelId: string, adapter: ProviderAdapter): void;
    registerTool(definition: ToolDefinition, executor: ToolExecutor): void;
    chat(message: string): AsyncGenerator<UnifiedMessage>;
    switchModel(modelId: string): Promise<void>;
    compact(): Promise<CompactionResult>;
    getSession(): {
        messages: UnifiedMessage[];
        model: string;
    };
    resume(sessionId: string): Promise<void>;
    listSessions(): ReturnType<SessionManager['listSessions']>;
    getToolRegistry(): ToolRegistry;
    getGateway(): ModelGateway;
}
export type { UnifiedMessage, ToolDefinition, ProviderAdapter } from '../messages/index.js';
export type { AgentConfig } from '../agent.js';
export type { CompactionResult } from '../compressor/index.js';
//# sourceMappingURL=index.d.ts.map