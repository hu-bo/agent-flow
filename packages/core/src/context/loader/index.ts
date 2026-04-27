import type { AgentRunRequest, ContextFragment, ContextLoader } from '../../types/index.js';

let fragmentCounter = 0;

function nextFragmentId(): string {
  fragmentCounter += 1;
  return `ctx_${Date.now()}_${fragmentCounter}`;
}

function estimateTokens(content: string): number {
  return Math.max(1, Math.ceil(content.length / 4));
}

export class DefaultContextLoader implements ContextLoader {
  async load(request: AgentRunRequest): Promise<ContextFragment[]> {
    const fragments: ContextFragment[] = [
      {
        id: nextFragmentId(),
        source: 'goal',
        content: request.goal,
        priority: 100,
        metadata: request.metadata ?? {},
        tokenEstimate: estimateTokens(request.goal)
      }
    ];

    for (const item of request.initialContext ?? []) {
      fragments.push({
        id: nextFragmentId(),
        source: item.source,
        content: item.content,
        priority: item.priority ?? 50,
        metadata: item.metadata ?? {},
        tokenEstimate: estimateTokens(item.content)
      });
    }

    return fragments;
  }
}
