import type { UnifiedMessage } from './messages/index.js';
import type { AgentConfig } from './agent.js';
import type { QueryEngine } from './query-engine.js';
import type { ContextStore } from './store/index.js';
import type { ContextCompressor } from './compressor/index.js';
import type { LocalCheckpointManager } from './checkpoint/index.js';
import { ToolRegistry } from './tool-registry.js';
import { PermissionManager } from './permission.js';
export type CoordinationStrategy = 'round-robin' | 'router' | 'hierarchical';
export interface TeamAgentConfig extends AgentConfig {
    role: string;
    capabilities?: string[];
}
export interface TeamConfig {
    agents: TeamAgentConfig[];
    strategy: CoordinationStrategy;
    maxRounds?: number;
}
export interface TeamDependencies {
    queryEngineFactory: (modelId: string) => QueryEngine;
    contextStore: ContextStore;
    compressor: ContextCompressor;
    checkpointManager: LocalCheckpointManager;
    toolRegistry: ToolRegistry;
    permissionManager: PermissionManager;
}
export declare class AgentTeam {
    private teamConfig;
    private deps;
    private agents;
    private currentIndex;
    constructor(teamConfig: TeamConfig, deps: TeamDependencies);
    run(task: string): AsyncGenerator<UnifiedMessage>;
    private runRoundRobin;
    private runRouter;
    private runHierarchical;
    private selectAgent;
}
//# sourceMappingURL=team.d.ts.map