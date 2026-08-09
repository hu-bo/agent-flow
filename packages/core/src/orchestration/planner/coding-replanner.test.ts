import { describe, expect, it } from 'vitest';
import type { ReplanContext } from '../../types/index.js';
import { CodingReplanner } from './coding-replanner.js';

function createReplanContext(goal: string): ReplanContext {
  const now = new Date().toISOString();
  return {
    attempt: 1,
    failedStep: {
      id: 'step_failed',
      title: 'failed-step',
      kind: 'tool',
      dependsOn: [],
      toolName: 'tool.fail',
      input: { path: 'a.ts' },
    },
    failedPlan: {
      id: 'plan_failed',
      strategy: 'plan',
      steps: [],
      completionContract: {
        objective: goal,
        maxRounds: 3,
        acceptance: { verifierName: 'coding' },
      },
    },
    error: 'simulated failure',
    request: {
      taskId: 'task_1',
      goal,
      strategy: 'plan',
      metadata: {
        userMessage: goal,
      },
    },
    session: {
      id: 'session_1',
      taskId: 'task_1',
      status: 'running',
      createdAt: now,
      updatedAt: now,
      metadata: {},
    },
    context: {
      fragments: [],
      tokenBudget: 8000,
      tokenUsed: 120,
      truncated: false,
    },
    outputs: {
      step_before: { ok: true },
    },
    checkpoints: [],
  };
}

describe('CodingReplanner', () => {
  it('returns recovery plan for coding requests', async () => {
    const replanner = new CodingReplanner();
    const decision = await replanner.replan(
      createReplanContext('fix failing tests in planner and verify regression'),
    );

    expect(decision).toBeDefined();
    expect(decision?.plan.metadata).toMatchObject({
      source: 'coding-replanner',
      previousPlanId: 'plan_failed',
      failedStepId: 'step_failed',
    });
    expect(decision?.plan.steps).toHaveLength(3);
    expect(decision?.plan.steps[0]?.title).toBe('replan-coding-analysis');
    expect(decision?.plan.steps[1]?.title).toBe('replan-coding-implementation');
    expect(decision?.plan.steps[2]?.title).toBe('replan-coding-verification');
    expect(decision?.plan.completionContract).toBeDefined();
  });

  it('returns undefined for non-coding requests', async () => {
    const replanner = new CodingReplanner();
    const ctx = createReplanContext('summarize architecture and explain tradeoffs');
    ctx.failedPlan.completionContract = {
      objective: ctx.request.goal,
      maxRounds: 3,
      acceptance: { verifierName: 'generic' },
    };
    const plan = await replanner.replan(ctx);
    expect(plan).toBeUndefined();
  });

  it('adds shell diagnostics step for file tool failures', async () => {
    const replanner = new CodingReplanner();
    const ctx = createReplanContext('fix read error and verify');
    ctx.failedStep.toolName = 'fs.read';
    ctx.failedStep.input = {
      path: 'packages/core/src/index.ts',
    };
    ctx.error = 'ENOENT: no such file or directory';

    const decision = await replanner.replan(ctx);
    expect(decision).toBeDefined();
    expect(decision?.plan.metadata).toMatchObject({
      recoveryStrategy: 'fs-diagnostics',
      errorCategory: 'not-found',
    });
    expect(decision?.plan.steps).toHaveLength(4);
    expect(decision?.plan.steps[0]).toMatchObject({
      title: 'replan-shell-file-diagnostics',
      kind: 'tool',
      toolName: 'shell.exec',
      input: {
        command: 'find',
        args: ['packages/core/src', '-maxdepth', '1', '-print'],
      },
    });
    expect(decision?.plan.steps[1]?.dependsOn).toEqual([decision?.plan.steps[0]?.id]);
    expect(decision?.plan.steps[1]?.consumes).toMatchObject({
      fsDiagnostics: decision?.plan.steps[0]?.id,
    });
  });

  it('adds shell diagnostics step for shell tool failures', async () => {
    const replanner = new CodingReplanner();
    const ctx = createReplanContext('fix shell command issue and verify');
    ctx.failedStep.toolName = 'shell.exec';
    ctx.failedStep.input = {
      command: 'pnpm',
      args: ['test'],
    };
    ctx.error = 'permission denied while running command';

    const decision = await replanner.replan(ctx);
    expect(decision).toBeDefined();
    expect(decision?.plan.metadata).toMatchObject({
      recoveryStrategy: 'shell-diagnostics',
      errorCategory: 'permission',
    });
    expect(decision?.plan.steps).toHaveLength(4);
    expect(decision?.plan.steps[0]).toMatchObject({
      title: 'replan-shell-diagnostics',
      kind: 'tool',
      toolName: 'shell.exec',
      input: {
        command: 'pwd',
      },
    });
    expect(decision?.plan.steps[1]?.dependsOn).toEqual([decision?.plan.steps[0]?.id]);
    expect(decision?.plan.steps[1]?.consumes).toMatchObject({
      shellDiagnostics: decision?.plan.steps[0]?.id,
    });
  });

  it('injects an objective verification step after coding verification failures', async () => {
    const replanner = new CodingReplanner();
    const ctx = createReplanContext('fix failing tests in planner and verify regression');
    ctx.trigger = 'verification_failure';
    ctx.failedStep = {
      id: 'step_validate',
      title: 'coding-validation',
      kind: 'llm',
      dependsOn: [],
    };
    ctx.verification = {
      status: 'failed',
      verifierName: 'coding',
      reason: 'Coding task requires objective verification evidence before completion.',
      missingEvidence: ['required:tool-success', 'runner-verification'],
      nextAction: 'Run the required verification command and capture its result before finishing.',
    };

    const decision = await replanner.replan(ctx);

    expect(decision).toBeDefined();
    expect(decision?.plan.steps).toHaveLength(4);
    expect(decision?.plan.steps[2]).toMatchObject({
      title: 'replan-objective-verification',
      kind: 'tool',
      toolName: 'shell.exec',
      input: {
        command: 'pnpm',
        args: ['test'],
        workingDir: '.',
        timeoutMs: 120000,
      },
    });
    expect(decision?.plan.steps[3]?.dependsOn).toEqual([decision?.plan.steps[2]?.id]);
    expect(decision?.plan.steps[3]?.consumes).toMatchObject({
      objectiveVerification: decision?.plan.steps[2]?.id,
    });
    expect(decision?.strategy.changes).toContain(
      'Inject a deterministic verification command before the final acceptance check.',
    );
  });
});
