import type { AgentPlan, GraphBuilder, TaskGraph, TaskGraphNode } from '../../types/index.js';

function assertDependencyExists(plan: AgentPlan): void {
  const ids = new Set(plan.steps.map((step) => step.id));
  for (const step of plan.steps) {
    for (const depId of step.dependsOn) {
      if (!ids.has(depId)) {
        throw new Error(`Step "${step.id}" depends on unknown step "${depId}".`);
      }
    }
  }
}

function assertAcyclic(graph: TaskGraph): void {
  const indegree = new Map<string, number>();
  for (const [stepId, node] of Object.entries(graph.nodes)) {
    indegree.set(stepId, node.incoming.length);
  }

  const queue: string[] = [];
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

export class DagGraphBuilder implements GraphBuilder {
  build(plan: AgentPlan): TaskGraph {
    if (plan.steps.length === 0) {
      throw new Error(`Plan "${plan.id}" has no step to execute.`);
    }

    assertDependencyExists(plan);

    const nodes: Record<string, TaskGraphNode> = {};
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

    const graph: TaskGraph = {
      planId: plan.id,
      nodes,
      roots
    };

    assertAcyclic(graph);
    return graph;
  }
}
