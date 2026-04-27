import type { AgentStep, Scheduler, TaskGraph } from '../../types/index.js';

export class TopologicalScheduler implements Scheduler {
  schedule(graph: TaskGraph): AgentStep[][] {
    const indegree = new Map<string, number>();
    for (const [id, node] of Object.entries(graph.nodes)) {
      indegree.set(id, node.incoming.length);
    }

    let frontier = Object.entries(graph.nodes)
      .filter(([, node]) => node.incoming.length === 0)
      .map(([id]) => id);

    const batches: AgentStep[][] = [];

    while (frontier.length > 0) {
      const batch: AgentStep[] = [];
      const nextFrontier: string[] = [];

      for (const stepId of frontier) {
        const node = graph.nodes[stepId];
        batch.push(node.step);

        for (const nextId of node.outgoing) {
          const degree = indegree.get(nextId);
          if (degree === undefined) {
            continue;
          }
          const updated = degree - 1;
          indegree.set(nextId, updated);
          if (updated === 0) {
            nextFrontier.push(nextId);
          }
        }
      }

      batches.push(batch);
      frontier = nextFrontier;
    }

    return batches;
  }
}
