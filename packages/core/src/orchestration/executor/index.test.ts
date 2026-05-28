import { describe, expect, it } from 'vitest';
import type {
  AgentPlan,
  AgentRunRequest,
  AgentRunResult,
  AgentSession,
  ContextEnvelope,
  Replanner,
  ToolExecutorLike,
  ToolResult,
} from '../../types/index.js';
import { DagGraphBuilder } from '../graph/index.js';
import { GuardrailChain } from '../guardrails/index.js';
import { CodingReplanner } from '../planner/coding-replanner.js';
import { TopologicalScheduler } from '../scheduler/index.js';
import { DefaultPlanExecutor, InlineRunner, RunnerRouter } from './index.js';
import { InMemoryCheckpointStore } from '../../state/checkpoint/index.js';

function createSession(taskId = 'task-1', sessionId = 'session-1'): AgentSession {
  const now = new Date().toISOString();
  return {
    id: sessionId,
    taskId,
    status: 'running',
    createdAt: now,
    updatedAt: now,
    metadata: {},
  };
}

const defaultContext: ContextEnvelope = {
  fragments: [],
  tokenBudget: 8000,
  tokenUsed: 256,
  truncated: false,
};

const defaultRequest: AgentRunRequest = {
  taskId: 'task-1',
  goal: 'test plan execution',
  strategy: 'plan',
};

async function drainExecution(
  plan: AgentPlan,
  toolExecutor: ToolExecutorLike,
  options: {
    replanner?: Replanner;
    maxReplans?: number;
    request?: AgentRunRequest;
  } = {},
): Promise<AgentRunResult> {
  const executor = new DefaultPlanExecutor({
    graphBuilder: new DagGraphBuilder(),
    scheduler: new TopologicalScheduler(),
    guardrails: new GuardrailChain([]),
    toolExecutor,
    checkpointStore: new InMemoryCheckpointStore(),
    runnerRouter: new RunnerRouter([new InlineRunner()]),
    replanner: options.replanner,
    maxReplans: options.maxReplans,
  });

  const stream = executor.execute(plan, options.request ?? defaultRequest, createSession(), defaultContext);
  while (true) {
    const next = await stream.next();
    if (next.done) {
      return next.value;
    }
  }
}

describe('DefaultPlanExecutor', () => {
  it('injects consumed artifacts into tool step inputs', async () => {
    const toolExecutor: ToolExecutorLike = {
      async execute(call): Promise<ToolResult> {
        if (call.name === 'tool.collect') {
          return {
            name: call.name,
            ok: true,
            output: {
              answer: 'artifact-value',
              nested: {
                key: 'deep-value',
              },
            },
          };
        }
        if (call.name === 'tool.apply') {
          return {
            name: call.name,
            ok: true,
            output: call.input,
          };
        }
        return {
          name: call.name,
          ok: false,
          error: `unexpected tool: ${call.name}`,
        };
      },
    };

    const plan: AgentPlan = {
      id: 'plan-artifact-tools',
      strategy: 'plan',
      steps: [
        {
          id: 'step_collect',
          title: 'collect',
          kind: 'tool',
          dependsOn: [],
          toolName: 'tool.collect',
          input: {},
        },
        {
          id: 'step_apply',
          title: 'apply',
          kind: 'tool',
          dependsOn: ['step_collect'],
          toolName: 'tool.apply',
          input: {
            staticValue: 'keep',
          },
          consumes: {
            artifact: 'step_collect.answer',
            deepArtifact: 'step_collect.nested.key',
          },
        },
      ],
    };

    const result = await drainExecution(plan, toolExecutor);
    expect(result.status).toBe('succeeded');
    expect(result.outputs.step_apply).toEqual({
      staticValue: 'keep',
      artifact: 'artifact-value',
      deepArtifact: 'deep-value',
    });
  });

  it('injects consumed artifacts into llm placeholder inputs', async () => {
    const toolExecutor: ToolExecutorLike = {
      async execute(call): Promise<ToolResult> {
        if (call.name !== 'tool.collect') {
          return {
            name: call.name,
            ok: false,
            error: `unexpected tool: ${call.name}`,
          };
        }
        return {
          name: call.name,
          ok: true,
          output: {
            summary: 'read-complete',
          },
        };
      },
    };

    const plan: AgentPlan = {
      id: 'plan-artifact-llm',
      strategy: 'plan',
      steps: [
        {
          id: 'step_collect',
          title: 'collect',
          kind: 'tool',
          dependsOn: [],
          toolName: 'tool.collect',
          input: {},
        },
        {
          id: 'step_reason',
          title: 'reason',
          kind: 'llm',
          dependsOn: ['step_collect'],
          consumes: {
            discovery: 'step_collect.summary',
          },
          input: {
            mode: 'analysis',
          },
        },
      ],
    };

    const result = await drainExecution(plan, toolExecutor);
    expect(result.status).toBe('succeeded');
    expect(result.outputs.step_reason).toMatchObject({
      mode: 'placeholder',
      stepInput: {
        mode: 'analysis',
        discovery: 'read-complete',
      },
    });
  });

  it('continues optional fs.read steps when the file is missing', async () => {
    const missingPath = 'E:\\Project\\my-project\\agent-flow\\apps\\web-server\\pnpm-workspace.yaml';
    const toolExecutor: ToolExecutorLike = {
      async execute(call): Promise<ToolResult> {
        if (call.name === 'fs.read') {
          return {
            name: call.name,
            ok: false,
            error: `open ${missingPath}: The system cannot find the file specified.`,
          };
        }
        return {
          name: call.name,
          ok: false,
          error: `unexpected tool: ${call.name}`,
        };
      },
    };

    const plan: AgentPlan = {
      id: 'plan-optional-read',
      strategy: 'plan',
      steps: [
        {
          id: 'read_workspace',
          title: 'repo.read_pnpm_workspace',
          kind: 'tool',
          dependsOn: [],
          toolName: 'fs.read',
          input: {
            path: 'pnpm-workspace.yaml',
            allowMissing: true,
          },
        },
        {
          id: 'reason',
          title: 'repo.analysis',
          kind: 'llm',
          dependsOn: ['read_workspace'],
          consumes: {
            pnpmWorkspace: 'read_workspace',
          },
          input: {
            mode: 'repo-analysis',
          },
        },
      ],
    };

    const result = await drainExecution(plan, toolExecutor);

    expect(result.status).toBe('succeeded');
    expect(result.outputs.read_workspace).toEqual({
      path: missingPath,
      size: 0,
      content: '',
      missing: true,
      error: `open ${missingPath}: The system cannot find the file specified.`,
    });
    expect(result.outputs.reason).toMatchObject({
      stepInput: {
        pnpmWorkspace: {
          missing: true,
        },
      },
    });
  });

  it('still fails fs.read missing files when allowMissing is not set', async () => {
    const toolExecutor: ToolExecutorLike = {
      async execute(call): Promise<ToolResult> {
        return {
          name: call.name,
          ok: false,
          error: 'open missing.txt: The system cannot find the file specified.',
        };
      },
    };

    const plan: AgentPlan = {
      id: 'plan-required-read',
      strategy: 'plan',
      steps: [
        {
          id: 'read_required',
          title: 'semantic-fs-read',
          kind: 'tool',
          dependsOn: [],
          toolName: 'fs.read',
          input: {
            path: 'missing.txt',
          },
        },
      ],
    };

    const result = await drainExecution(plan, toolExecutor);

    expect(result.status).toBe('failed');
    expect(result.error).toBe('open missing.txt: The system cannot find the file specified.');
  });

  it('replans after step failure and succeeds with recovery plan', async () => {
    const toolExecutor: ToolExecutorLike = {
      async execute(call): Promise<ToolResult> {
        if (call.name === 'tool.fail') {
          return {
            name: call.name,
            ok: false,
            error: 'simulated failure',
          };
        }
        if (call.name === 'tool.recover') {
          return {
            name: call.name,
            ok: true,
            output: {
              recovered: true,
            },
          };
        }
        return {
          name: call.name,
          ok: false,
          error: `unexpected tool: ${call.name}`,
        };
      },
    };

    const plan: AgentPlan = {
      id: 'plan-fail',
      strategy: 'plan',
      steps: [
        {
          id: 'step_fail',
          title: 'fail',
          kind: 'tool',
          dependsOn: [],
          toolName: 'tool.fail',
          input: {},
        },
      ],
    };

    const replanner: Replanner = {
      async replan(ctx): Promise<AgentPlan | undefined> {
        expect(ctx.failedStep.id).toBe('step_fail');
        return {
          id: 'plan-recovery',
          strategy: 'plan',
          steps: [
            {
              id: 'step_recover',
              title: 'recover',
              kind: 'tool',
              dependsOn: [],
              toolName: 'tool.recover',
              input: {},
            },
          ],
        };
      },
    };

    const result = await drainExecution(plan, toolExecutor, {
      replanner,
      maxReplans: 1,
    });

    expect(result.status).toBe('succeeded');
    expect(result.outputs.step_recover).toEqual({
      recovered: true,
    });
    expect(result.events.some((event) => event.type === 'session.replanned')).toBe(true);
  });

  it('uses built-in coding replanner to recover coding task failures', async () => {
    const toolExecutor: ToolExecutorLike = {
      async execute(call): Promise<ToolResult> {
        if (call.name === 'tool.fail') {
          return {
            name: call.name,
            ok: false,
            error: 'simulated coding failure',
          };
        }
        return {
          name: call.name,
          ok: false,
          error: `unexpected tool: ${call.name}`,
        };
      },
    };

    const plan: AgentPlan = {
      id: 'plan-coding-fail',
      strategy: 'plan',
      steps: [
        {
          id: 'step_fail',
          title: 'fail',
          kind: 'tool',
          dependsOn: [],
          toolName: 'tool.fail',
          input: {},
        },
      ],
    };

    const result = await drainExecution(
      plan,
      toolExecutor,
      {
        replanner: new CodingReplanner(),
        maxReplans: 1,
        request: {
          ...defaultRequest,
          goal: 'fix failing tests in planner and verify regression',
        },
      },
    );

    expect(result.status).toBe('succeeded');
    expect(result.events.some((event) => event.type === 'session.replanned')).toBe(true);
    const outputKeys = Object.keys(result.outputs);
    expect(outputKeys.some((key) => key.startsWith('replan_step_'))).toBe(true);
  });
});
