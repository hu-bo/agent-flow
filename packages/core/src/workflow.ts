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

export type WorkflowEvent =
  | { type: 'node-start'; nodeId: string; timestamp: string }
  | { type: 'node-complete'; nodeId: string; result: unknown; timestamp: string }
  | { type: 'node-error'; nodeId: string; error: Error; timestamp: string }
  | { type: 'workflow-complete'; timestamp: string }
  | { type: 'message'; message: UnifiedMessage };

export type NodeExecutor = (
  node: WorkflowNode,
  context: WorkflowContext,
) => AsyncGenerator<WorkflowEvent>;

export class WorkflowEngine {
  private executors = new Map<string, NodeExecutor>();
  private maxLoopIterations: number;

  constructor(config?: { maxLoopIterations?: number }) {
    this.maxLoopIterations = config?.maxLoopIterations ?? 100;
  }

  registerExecutor(nodeType: string, executor: NodeExecutor): void {
    this.executors.set(nodeType, executor);
  }

  async *execute(workflow: WorkflowDefinition): AsyncGenerator<WorkflowEvent> {
    const adjacency = this.buildAdjacency(workflow);
    const context: WorkflowContext = {
      variables: {},
      messages: [],
      currentNodeId: workflow.entryNodeId,
      iteration: 0,
    };

    const visited = new Set<string>();
    const queue: string[] = [workflow.entryNodeId];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const node = workflow.nodes.find(n => n.id === nodeId);
      if (!node) throw new Error(`Node not found: ${nodeId}`);

      context.currentNodeId = nodeId;

      if (node.type === 'parallel' && node.next && node.next.length > 1) {
        yield* this.executeParallel(workflow, node.next, context);
        // After parallel, find edges from parallel node's children
        for (const childId of node.next) {
          const childEdges = adjacency.get(childId) ?? [];
          for (const edge of childEdges) {
            if (!visited.has(edge.to)) queue.push(edge.to);
          }
        }
        continue;
      }

      if (node.type === 'loop') {
        yield* this.executeLoop(workflow, node, context);
        visited.add(nodeId);
        const edges = adjacency.get(nodeId) ?? [];
        for (const edge of edges) {
          if (!visited.has(edge.to) && this.evaluateEdge(edge, context)) {
            queue.push(edge.to);
          }
        }
        continue;
      }

      yield { type: 'node-start', nodeId, timestamp: new Date().toISOString() };

      try {
        const executor = this.executors.get(node.type);
        if (!executor) throw new Error(`No executor for node type: ${node.type}`);

        for await (const event of executor(node, context)) {
          yield event;
          if (event.type === 'message') context.messages.push(event.message);
        }

        yield { type: 'node-complete', nodeId, result: null, timestamp: new Date().toISOString() };
      } catch (error) {
        yield { type: 'node-error', nodeId, error: error as Error, timestamp: new Date().toISOString() };
        throw error;
      }

      visited.add(nodeId);

      const edges = adjacency.get(nodeId) ?? [];
      for (const edge of edges) {
        if (!visited.has(edge.to) && this.evaluateEdge(edge, context)) {
          queue.push(edge.to);
        }
      }
    }

    yield { type: 'workflow-complete', timestamp: new Date().toISOString() };
  }

  private async *executeParallel(
    workflow: WorkflowDefinition,
    nodeIds: string[],
    context: WorkflowContext,
  ): AsyncGenerator<WorkflowEvent> {
    const results = await Promise.all(
      nodeIds.map(async (nodeId) => {
        const node = workflow.nodes.find(n => n.id === nodeId);
        if (!node) throw new Error(`Node not found: ${nodeId}`);
        const executor = this.executors.get(node.type);
        if (!executor) throw new Error(`No executor for node type: ${node.type}`);

        const events: WorkflowEvent[] = [];
        const childContext = { ...context, currentNodeId: nodeId };
        for await (const event of executor(node, childContext)) {
          events.push(event);
        }
        return events;
      }),
    );

    for (const events of results) {
      for (const event of events) {
        yield event;
        if (event.type === 'message') context.messages.push(event.message);
      }
    }
  }

  private async *executeLoop(
    workflow: WorkflowDefinition,
    node: WorkflowNode,
    context: WorkflowContext,
  ): AsyncGenerator<WorkflowEvent> {
    const maxIterations = (node.config.maxIterations as number) ?? this.maxLoopIterations;
    const bodyNodeIds = (node.config.bodyNodes as string[]) ?? [];
    const conditionFn = node.config.condition as ((ctx: WorkflowContext) => boolean) | undefined;

    for (let i = 0; i < maxIterations; i++) {
      context.iteration = i;

      if (conditionFn && !conditionFn(context)) break;

      for (const bodyNodeId of bodyNodeIds) {
        const bodyNode = workflow.nodes.find(n => n.id === bodyNodeId);
        if (!bodyNode) continue;

        yield { type: 'node-start', nodeId: bodyNodeId, timestamp: new Date().toISOString() };

        const executor = this.executors.get(bodyNode.type);
        if (!executor) throw new Error(`No executor for node type: ${bodyNode.type}`);

        for await (const event of executor(bodyNode, context)) {
          yield event;
          if (event.type === 'message') context.messages.push(event.message);
        }

        yield { type: 'node-complete', nodeId: bodyNodeId, result: null, timestamp: new Date().toISOString() };
      }
    }
  }

  private buildAdjacency(workflow: WorkflowDefinition): Map<string, WorkflowEdge[]> {
    const map = new Map<string, WorkflowEdge[]>();
    for (const edge of workflow.edges) {
      const list = map.get(edge.from) ?? [];
      list.push(edge);
      map.set(edge.from, list);
    }
    return map;
  }

  private evaluateEdge(edge: WorkflowEdge, context: WorkflowContext): boolean {
    if (!edge.condition) return true;
    return edge.condition(context);
  }
}

