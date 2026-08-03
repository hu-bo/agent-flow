function assertDependencyExists(plan) {
    const ids = new Set(plan.steps.map((step) => step.id));
    for (const step of plan.steps) {
        for (const depId of step.dependsOn) {
            if (!ids.has(depId)) {
                throw new Error(`Step "${step.id}" depends on unknown step "${depId}".`);
            }
        }
    }
}
function assertAcyclic(graph) {
    const indegree = new Map();
    for (const [stepId, node] of Object.entries(graph.nodes)) {
        indegree.set(stepId, node.incoming.length);
    }
    const queue = [];
    for (const [stepId, degree] of indegree.entries()) {
        if (degree === 0) {
            queue.push(stepId);
        }
    }
    let visited = 0;
    while (queue.length > 0) {
        const current = queue.shift();
        if (!current) {
            break;
        }
        visited += 1;
        for (const next of graph.nodes[current].outgoing) {
            const currentDegree = indegree.get(next);
            if (currentDegree === undefined) {
                continue;
            }
            const updated = currentDegree - 1;
            indegree.set(next, updated);
            if (updated === 0) {
                queue.push(next);
            }
        }
    }
    if (visited !== Object.keys(graph.nodes).length) {
        throw new Error(`Plan "${graph.planId}" contains cycle(s).`);
    }
}
export class DagGraphBuilder {
    build(plan) {
        if (plan.steps.length === 0) {
            throw new Error(`Plan "${plan.id}" has no step to execute.`);
        }
        assertDependencyExists(plan);
        const nodes = {};
        for (const step of plan.steps) {
            nodes[step.id] = {
                step,
                incoming: [...step.dependsOn],
                outgoing: []
            };
        }
        for (const step of plan.steps) {
            for (const depId of step.dependsOn) {
                nodes[depId].outgoing.push(step.id);
            }
        }
        const roots = Object.values(nodes)
            .filter((node) => node.incoming.length === 0)
            .map((node) => node.step.id);
        const graph = {
            planId: plan.id,
            nodes,
            roots
        };
        assertAcyclic(graph);
        return graph;
    }
}
