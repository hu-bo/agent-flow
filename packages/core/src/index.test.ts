import { describe, expect, it } from 'vitest';
import { createAgent } from './index.js';
import type {
  AgentEvent,
  AgentPlan,
  ContextEnvelope,
  Planner,
  ToolExecutorLike,
  ToolResult
} from './types/index.js';

const context: ContextEnvelope = {
  fragments: [],
  tokenBudget: 8000,
  tokenUsed: 0,
  truncated: false
};

describe('createAgent runtime event forwarding', () => {
  it('forwards granular executor events through run onEvent once', async () => {
    const plan: AgentPlan = {
      id: 'plan-runtime-trace',
      strategy: 'plan',
      steps: [
        {
          id: 'step_read',
          title: 'Read project files',
          kind: 'tool',
          dependsOn: [],
          toolName: 'fs.read',
          input: {
            path: 'README.md'
          }
        }
      ]
    };

    const planner: Planner = {
      async plan() {
        return plan;
      }
    };

    const toolExecutor: ToolExecutorLike = {
      async execute(call): Promise<ToolResult> {
        return {
          name: call.name,
          ok: true,
          output: {
            path: 'README.md',
            content: '# Agent Flow'
          }
        };
      }
    };

    const runtime = createAgent({
      planner,
      contextBuilder: {
        async build() {
          return context;
        }
      },
      toolExecutor
    });

    const observed: AgentEvent[] = [];
    const result = await runtime.run(
      {
        goal: 'understand the project'
      },
      {
        async onEvent(event) {
          observed.push(event);
        }
      }
    );

    expect(result.status).toBe('succeeded');
    expect(observed.map((event) => event.type)).toEqual([
      'session.started',
      'step.started',
      'tool.called',
      'tool.result',
      'checkpoint.created',
      'step.completed',
      'session.completed'
    ]);
    expect(new Set(observed.map((event) => event.id)).size).toBe(observed.length);
  });
});
