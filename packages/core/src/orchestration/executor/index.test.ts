import { describe, expect, it } from 'vitest';
import type {
  AgentPlan,
  AgentRunRequest,
  AgentRunResult,
  AgentSession,
  ContextEnvelope,
  LlmStepExecutorLike,
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

function retryWithDistinctStrategy(plan: AgentPlan): Replanner {
  return {
    async replan(ctx) {
      return {
        plan: { ...plan, id: `${plan.id}-attempt-${ctx.attempt + 1}` },
        reflection: {
          summary: ctx.error,
          cause: ctx.trigger ?? 'verification_failure',
          evidence: ctx.verification?.evidence ?? [],
          failureFingerprint: `failure-${ctx.attempt}`,
        },
        strategy: {
          id: `retry-${ctx.attempt + 1}`,
          fingerprint: `retry-${ctx.attempt + 1}`,
          summary: 'Retry with verifier feedback.',
          changes: ['Use the latest verifier feedback.'],
          verification: plan.completionContract?.acceptance.verifierName ?? 'generic',
        },
      };
    },
  };
}

async function drainExecution(
  plan: AgentPlan,
  toolExecutor: ToolExecutorLike,
  options: {
    replanner?: Replanner;
    maxReplans?: number;
    request?: AgentRunRequest;
    llmExecutor?: LlmStepExecutorLike;
  } = {},
): Promise<AgentRunResult> {
  const executor = new DefaultPlanExecutor({
    graphBuilder: new DagGraphBuilder(),
    scheduler: new TopologicalScheduler(),
    guardrails: new GuardrailChain([]),
    toolExecutor,
    llmExecutor: options.llmExecutor,
    checkpointStore: new InMemoryCheckpointStore(),
    runnerRouter: new RunnerRouter([new InlineRunner()]),
    replanner: options.replanner,
    maxReplans: options.maxReplans,
  });

  const planWithContract: AgentPlan = plan.completionContract
    ? plan
    : {
        ...plan,
        completionContract: {
          objective: options.request?.goal ?? defaultRequest.goal,
          maxRounds: Math.max(1, (options.maxReplans ?? 0) + 1),
          acceptance: { verifierName: 'generic' },
        },
      };
  const stream = executor.execute(planWithContract, options.request ?? defaultRequest, createSession(), defaultContext);
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

  it('emits the normalized plan shape when a session starts', async () => {
    const toolExecutor: ToolExecutorLike = {
      async execute(call): Promise<ToolResult> {
        return {
          name: call.name,
          ok: true,
          output: {
            ok: true,
          },
        };
      },
    };

    const plan: AgentPlan = {
      id: 'plan-visible-shape',
      strategy: 'plan',
      metadata: {
        workflow: 'tool-first',
      },
      steps: [
        {
          id: 'inspect',
          title: 'inspect workspace',
          kind: 'tool',
          dependsOn: [],
          toolName: 'fs.list',
          input: {
            path: '.',
          },
        },
      ],
    };

    const result = await drainExecution(plan, toolExecutor);
    const started = result.events.find((event) => event.type === 'session.started');

    expect(started?.payload).toMatchObject({
      planId: 'plan-visible-shape',
      strategy: 'plan',
      metadata: {
        workflow: 'tool-first',
      },
      steps: [
        {
          id: 'inspect',
          title: 'inspect workspace',
          kind: 'tool',
          toolName: 'fs.list',
          input: {
            path: '.',
          },
        },
      ],
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
          title: 'required fs read',
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

  it('retries verification on a second Ralph round and succeeds when verifier evidence appears', async () => {
    let llmCallCount = 0;
    const toolExecutor: ToolExecutorLike = {
      async execute(call): Promise<ToolResult> {
        if (call.name === 'fs.list') {
          return {
            name: call.name,
            ok: true,
            output: {
              path: '.',
              total: 3,
              entries: [{ name: 'README.md', type: 'file' }],
            },
          };
        }
        if (call.name === 'fs.read') {
          return {
            name: call.name,
            ok: true,
            output: {
              path: String((call.input as Record<string, unknown>).path ?? 'README.md'),
              size: 10,
              content: 'agent-flow',
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

    const llmExecutor: LlmStepExecutorLike = {
      async execute(request) {
        llmCallCount += 1;
        if (request.step.title === 'repo.analysis') {
          return {
            mode: 'llm-step',
            stepId: request.step.id,
            title: request.step.title,
            phase: 'analysis',
            text: 'The repository is a monorepo.',
            sections: {
              analysis: 'The repository is a monorepo.',
            },
          };
        }
        if (llmCallCount < 3) {
          return {
            mode: 'llm-step',
            stepId: request.step.id,
            title: request.step.title,
            phase: 'implementation',
            text: 'High-level summary only.',
            sections: {
              implementation: 'High-level summary only.',
            },
            incompleteReason: 'Need direct repo evidence in the final summary.',
            nextAction: 'Reference actual files that were scanned.',
          };
        }
        return {
          mode: 'llm-step',
          stepId: request.step.id,
          title: request.step.title,
          phase: 'implementation',
          text: 'README.md and package.json show this is an agent-flow monorepo. COMPLETE',
          sections: {
            implementation: 'README.md and package.json show this is an agent-flow monorepo.',
          },
          completionSignal: 'COMPLETE',
          evidence: ['README.md', 'package.json'],
        };
      },
    };

    const plan: AgentPlan = {
      id: 'plan-ralph-repo',
      strategy: 'plan',
      metadata: {
        workflow: 'repo-understanding',
      },
      completionContract: {
        objective: 'Understand the repository',
        completionSignal: 'COMPLETE',
        maxRounds: 3,
        acceptance: {
          verifierName: 'repo-understanding',
        },
      },
      steps: [
        {
          id: 'scan',
          title: 'repo.scan',
          kind: 'tool',
          dependsOn: [],
          toolName: 'fs.list',
          input: { path: '.' },
        },
        {
          id: 'readme',
          title: 'repo.read_readme',
          kind: 'tool',
          dependsOn: [],
          toolName: 'fs.read',
          input: { path: 'README.md' },
        },
        {
          id: 'pkg',
          title: 'repo.read_package_json',
          kind: 'tool',
          dependsOn: [],
          toolName: 'fs.read',
          input: { path: 'package.json' },
        },
        {
          id: 'analysis',
          title: 'repo.analysis',
          kind: 'llm',
          dependsOn: ['scan', 'readme', 'pkg'],
          consumes: {
            repoTree: 'scan',
            readme: 'readme',
            packageJson: 'pkg',
          },
        },
        {
          id: 'summary',
          title: 'repo.summary',
          kind: 'llm',
          dependsOn: ['analysis'],
          consumes: {
            analysis: 'analysis',
          },
        },
      ],
    };

    const result = await drainExecution(plan, toolExecutor, {
      llmExecutor,
      replanner: retryWithDistinctStrategy(plan),
      maxReplans: 2,
    });

    expect(result.status).toBe('succeeded');
    expect(result.rounds).toBe(2);
    expect(result.events.filter((event) => event.type === 'session.verification')).toHaveLength(2);
    expect(
      result.checkpoints.some((checkpoint) => checkpoint.stepId === 'attempt_session-1_1'),
    ).toBe(true);
  });

  it('returns blocked after verifier fails for three Ralph rounds', async () => {
    const toolExecutor: ToolExecutorLike = {
      async execute(call): Promise<ToolResult> {
        return {
          name: call.name,
          ok: true,
          output: {
            path: '.',
            total: 1,
            entries: [{ name: 'README.md', type: 'file' }],
          },
        };
      },
    };

    const llmExecutor: LlmStepExecutorLike = {
      async execute(request) {
        return {
          mode: 'llm-step',
          stepId: request.step.id,
          title: request.step.title,
          phase: request.step.title.includes('summary') ? 'implementation' : 'analysis',
          text: 'Still not enough evidence.',
          sections: {
            analysis: 'Still not enough evidence.',
          },
          incompleteReason: 'Need more concrete evidence.',
          nextAction: 'Read and cite repository files directly.',
        };
      },
    };

    const plan: AgentPlan = {
      id: 'plan-ralph-blocked',
      strategy: 'plan',
      metadata: {
        workflow: 'repo-understanding',
      },
      completionContract: {
        objective: 'Understand the repository',
        completionSignal: 'COMPLETE',
        maxRounds: 3,
        acceptance: {
          verifierName: 'repo-understanding',
        },
      },
      steps: [
        {
          id: 'scan',
          title: 'repo.scan',
          kind: 'tool',
          dependsOn: [],
          toolName: 'fs.list',
          input: { path: '.' },
        },
        {
          id: 'summary',
          title: 'repo.summary',
          kind: 'llm',
          dependsOn: ['scan'],
          consumes: {
            repoTree: 'scan',
          },
        },
      ],
    };

    const result = await drainExecution(plan, toolExecutor, {
      llmExecutor,
      replanner: retryWithDistinctStrategy(plan),
      maxReplans: 2,
    });

    expect(result.status).toBe('blocked');
    expect(result.rounds).toBe(3);
    expect(result.verification?.status).toBe('blocked');
    expect(result.error).toContain('Need more concrete evidence.');
  });

  it('fails verification when completion signal is required but missing', async () => {
    const toolExecutor: ToolExecutorLike = {
      async execute(call): Promise<ToolResult> {
        return {
          name: call.name,
          ok: true,
          output: {
            command: 'pnpm test',
            stdout: ['ok'],
            stderr: [],
          },
        };
      },
    };

    const llmExecutor: LlmStepExecutorLike = {
      async execute(request) {
        return {
          mode: 'llm-step',
          stepId: request.step.id,
          title: request.step.title,
          phase: 'verification',
          text: 'Verification looks good.',
          sections: {
            verification: 'Verification looks good.',
          },
          evidence: ['pnpm test passed'],
        };
      },
    };

    const plan: AgentPlan = {
      id: 'plan-signal-required',
      strategy: 'plan',
      metadata: {
        workflow: 'generic',
      },
      completionContract: {
        objective: 'Verify completion',
        completionSignal: 'COMPLETE',
        maxRounds: 1,
        acceptance: {
          verifierName: 'generic',
          requireCompletionSignal: true,
        },
      },
      steps: [
        {
          id: 'verification',
          title: 'quality-verification',
          kind: 'llm',
          dependsOn: [],
        },
      ],
    };

    const result = await drainExecution(plan, toolExecutor, {
      llmExecutor,
    });

    expect(result.status).toBe('blocked');
    expect(result.verification).toMatchObject({
      status: 'blocked',
      verifierName: 'generic',
    });
    expect(result.error).toContain('Completion signal was required');
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
          metadata: {
            intent: {
              wantsModification: true,
              wantsVerification: true,
              isCodingTask: true,
              codingTaskType: 'bugfix',
            },
          },
        },
      },
    );

    expect(result.status).toBe('succeeded');
    expect(result.events.some((event) => event.type === 'session.replanned')).toBe(true);
    const outputKeys = Object.keys(result.outputs);
    expect(outputKeys.some((key) => key.startsWith('replan_step_'))).toBe(true);
  });

  it('recovers coding verification failures by inserting objective verification evidence', async () => {
    const toolExecutor: ToolExecutorLike = {
      async execute(call): Promise<ToolResult> {
        if (call.name === 'shell.exec') {
          expect(call.input).toMatchObject({
            command: 'pnpm',
            args: ['test'],
          });
          return {
            name: call.name,
            ok: true,
            output: {
              command: 'pnpm',
              args: ['test'],
              exitCode: 0,
              stdout: ['ok'],
              stderr: [],
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

    const llmExecutor: LlmStepExecutorLike = {
      async execute(request) {
        if (request.step.title.includes('analysis')) {
          return {
            mode: 'llm-step',
            stepId: request.step.id,
            title: request.step.title,
            phase: 'analysis',
            text: 'Diagnosed the coding issue.',
            sections: {
              analysis: 'Diagnosed the coding issue.',
            },
          };
        }
        if (request.step.title.includes('implementation')) {
          return {
            mode: 'llm-step',
            stepId: request.step.id,
            title: request.step.title,
            phase: 'implementation',
            text: 'Applied the fix.',
            sections: {
              implementation: 'Applied the fix.',
            },
          };
        }
        return {
          mode: 'llm-step',
          stepId: request.step.id,
          title: request.step.title,
          phase: 'verification',
          text: 'Verification completed successfully. COMPLETE',
          sections: {
            verification: 'Verification completed successfully.',
          },
          completionSignal: 'COMPLETE',
          evidence: ['pnpm test passed'],
        };
      },
    };

    const plan: AgentPlan = {
      id: 'plan-coding-verification-missing-evidence',
      strategy: 'plan',
      completionContract: {
        objective: 'fix failing tests in planner and verify regression',
        completionSignal: 'COMPLETE',
        maxRounds: 2,
        acceptance: {
          verifierName: 'coding',
          requiredEvidence: ['tool-success'],
        },
      },
      steps: [
        {
          id: 'step_analysis',
          title: 'coding-analysis',
          kind: 'llm',
          dependsOn: [],
          input: {
            mode: 'analysis',
          },
        },
        {
          id: 'step_implementation',
          title: 'coding-implementation',
          kind: 'llm',
          dependsOn: ['step_analysis'],
          consumes: {
            analysis: 'step_analysis',
          },
          input: {
            mode: 'implementation',
          },
        },
        {
          id: 'step_validation',
          title: 'coding-validation',
          kind: 'llm',
          dependsOn: ['step_implementation'],
          consumes: {
            implementation: 'step_implementation',
          },
          input: {
            mode: 'validation',
          },
        },
      ],
    };

    const result = await drainExecution(plan, toolExecutor, {
      llmExecutor,
      replanner: new CodingReplanner(),
      maxReplans: 1,
      request: {
        ...defaultRequest,
        goal: 'fix failing tests in planner and verify regression',
        metadata: {
          intent: {
            wantsModification: true,
            wantsVerification: true,
            isCodingTask: true,
            codingTaskType: 'bugfix',
          },
          userMessage: 'fix failing tests in planner and verify regression',
        },
      },
    });

    expect(result.status).toBe('succeeded');
    expect(result.rounds).toBe(2);
    expect(result.events.some((event) => event.type === 'session.replanned')).toBe(true);
    expect(
      result.events.some(
        (event) =>
          event.type === 'tool.result'
          && event.payload.tool === 'shell.exec'
          && event.payload.ok === true,
      ),
    ).toBe(true);
    expect(result.verification).toMatchObject({
      status: 'passed',
      verifierName: 'coding',
    });
  });
});
