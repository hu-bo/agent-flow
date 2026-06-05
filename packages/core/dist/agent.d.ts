import type { UnifiedMessage } from './messages/index.js';
import { QueryEngine } from './query-engine.js';
import type { ContextStore } from './store/index.js';
import type { ContextCompressor } from './compressor/index.js';
import type { LocalCheckpointManager } from './checkpoint/index.js';
import { ToolRegistry } from './tool-registry.js';
import { PermissionManager } from './permission.js';
export interface AgentConfig {
    modelId: string;
    systemPrompt?: string;
    tools?: string[];
    maxTurns?: number;
}
export interface AgentDependencies {
    contextStore: ContextStore;
    toolRegistry: ToolRegistry;
    compressor: ContextCompressor;
    checkpointManager: LocalCheckpointManager;
    permissionManager: PermissionManager;
}
/** Agent �?orchestrates the main conversation loop */
export declare class Agent {
    private queryEngine;
    private config;
    private contextStore;
    private toolRegistry;
    private compressor;
    private checkpointManager;
    private permissionManager;
    private totalUsage;
    constructor(queryEngine: QueryEngine, config: AgentConfig, deps: AgentDependencies);
    run(userMessage: string): AsyncGenerator<UnifiedMessage>;
    private maybeAutoCompact;
    private saveCheckpoint;
    private createMessage;
}
//# sourceMappingURL=agent.d.ts.map