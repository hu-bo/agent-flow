import type { UnifiedMessage } from './messages/index.js';
export interface WorkflowNode {
    id: string;
    type: 'agent' | 'tool' | 'condition' | 'parallel' | 'loop';
    config: Record<string, unknown>;
    next?: string[];
}
export interface WorkflowEdge {
    from: string;
    to: string;
    condition?: (context: WorkflowContext) => boolean;
}
export interface WorkflowDefinition {
    id: string;
    name: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    entryNodeId: string;
}
export interface WorkflowContext {
    variables: Record<string, unknown>;
    messages: UnifiedMessage[];
    currentNodeId: string;
    iteration: number;
}
export type WorkflowEvent = {
    type: 'node-start';
    nodeId: string;
    timestamp: string;
} | {
    type: 'node-complete';
    nodeId: string;
    result: unknown;
    timestamp: string;
} | {
    type: 'node-error';
    nodeId: string;
    error: Error;
    timestamp: string;
} | {
    type: 'workflow-complete';
    timestamp: string;
} | {
    type: 'message';
    message: UnifiedMessage;
};
export type NodeExecutor = (node: WorkflowNode, context: WorkflowContext) => AsyncGenerator<WorkflowEvent>;
export declare class WorkflowEngine {
    private executors;
    private maxLoopIterations;
    constructor(config?: {
        maxLoopIterations?: number;
    });
    registerExecutor(nodeType: string, executor: NodeExecutor): void;
    execute(workflow: WorkflowDefinition): AsyncGenerator<WorkflowEvent>;
    private executeParallel;
    private executeLoop;
    private buildAdjacency;
    private evaluateEdge;
}
//# sourceMappingURL=workflow.d.ts.map