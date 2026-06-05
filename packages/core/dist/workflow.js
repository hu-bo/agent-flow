export class WorkflowEngine {
    executors = new Map();
    maxLoopIterations;
    constructor(config) {
        this.maxLoopIterations = config?.maxLoopIterations ?? 100;
    }
    registerExecutor(nodeType, executor) {
        this.executors.set(nodeType, executor);
    }
    async *execute(workflow) {
        const adjacency = this.buildAdjacency(workflow);
        const context = {
            variables: {},
            messages: [],
            currentNodeId: workflow.entryNodeId,
            iteration: 0,
        };
        const visited = new Set();
        const queue = [workflow.entryNodeId];
        while (queue.length > 0) {
            const nodeId = queue.shift();
            const node = workflow.nodes.find(n => n.id === nodeId);
            if (!node)
                throw new Error(`Node not found: ${nodeId}`);
            context.currentNodeId = nodeId;
            if (node.type === 'parallel' && node.next && node.next.length > 1) {
                yield* this.executeParallel(workflow, node.next, context);
                // After parallel, find edges from parallel node's children
                for (const childId of node.next) {
                    const childEdges = adjacency.get(childId) ?? [];
                    for (const edge of childEdges) {
                        if (!visited.has(edge.to))
                            queue.push(edge.to);
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
                if (!executor)
                    throw new Error(`No executor for node type: ${node.type}`);
                for await (const event of executor(node, context)) {
                    yield event;
                    if (event.type === 'message')
                        context.messages.push(event.message);
                }
                yield { type: 'node-complete', nodeId, result: null, timestamp: new Date().toISOString() };
            }
            catch (error) {
                yield { type: 'node-error', nodeId, error: error, timestamp: new Date().toISOString() };
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
    async *executeParallel(workflow, nodeIds, context) {
        const results = await Promise.all(nodeIds.map(async (nodeId) => {
            const node = workflow.nodes.find(n => n.id === nodeId);
            if (!node)
                throw new Error(`Node not found: ${nodeId}`);
            const executor = this.executors.get(node.type);
            if (!executor)
                throw new Error(`No executor for node type: ${node.type}`);
            const events = [];
            const childContext = { ...context, currentNodeId: nodeId };
            for await (const event of executor(node, childContext)) {
                events.push(event);
            }
            return events;
        }));
        for (const events of results) {
            for (const event of events) {
                yield event;
                if (event.type === 'message')
                    context.messages.push(event.message);
            }
        }
    }
    async *executeLoop(workflow, node, context) {
        const maxIterations = node.config.maxIterations ?? this.maxLoopIterations;
        const bodyNodeIds = node.config.bodyNodes ?? [];
        const conditionFn = node.config.condition;
        for (let i = 0; i < maxIterations; i++) {
            context.iteration = i;
            if (conditionFn && !conditionFn(context))
                break;
            for (const bodyNodeId of bodyNodeIds) {
                const bodyNode = workflow.nodes.find(n => n.id === bodyNodeId);
                if (!bodyNode)
                    continue;
                yield { type: 'node-start', nodeId: bodyNodeId, timestamp: new Date().toISOString() };
                const executor = this.executors.get(bodyNode.type);
                if (!executor)
                    throw new Error(`No executor for node type: ${bodyNode.type}`);
                for await (const event of executor(bodyNode, context)) {
                    yield event;
                    if (event.type === 'message')
                        context.messages.push(event.message);
                }
                yield { type: 'node-complete', nodeId: bodyNodeId, result: null, timestamp: new Date().toISOString() };
            }
        }
    }
    buildAdjacency(workflow) {
        const map = new Map();
        for (const edge of workflow.edges) {
            const list = map.get(edge.from) ?? [];
            list.push(edge);
            map.set(edge.from, list);
        }
        return map;
    }
    evaluateEdge(edge, context) {
        if (!edge.condition)
            return true;
        return edge.condition(context);
    }
}
//# sourceMappingURL=workflow.js.map