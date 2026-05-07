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
    const plan = await replanner.replan(
      createReplanContext('fix failing tests in planner and verify regression'),
    );

    expect(plan).toBeDefined();
    expect(plan?.metadata).toMatchObject({
      source: 'coding-replanner',
      previousPlanId: 'plan_failed',
      failedStepId: 'step_failed',
    });
    expect(plan?.steps).toHaveLength(3);
    expect(plan?.steps[0]?.title).toBe('replan-coding-analysis');
    expect(plan?.steps[1]?.title).toBe('replan-coding-implementation');
    expect(plan?.steps[2]?.title).toBe('replan-coding-verification');
  });

  it('returns undefined for non-coding requests', async () => {
    const replanner = new CodingReplanner();
    const plan = await replanner.replan(
      createReplanContext('summarize architecture and explain tradeoffs'),
    );
    expect(plan).toBeUndefined();
  });

  it('adds fs diagnostics step for fs tool failures', async () => {
    const replanner = new CodingReplanner();
    const ctx = createReplanContext('fix read error and verify');
    ctx.failedStep.toolName = 'fs.read';
    ctx.failedStep.input = {
      path: 'packages/core/src/index.ts',
    };
    ctx.error = 'ENOENT: no such file or directory';

    const plan = await replanner.replan(ctx);
    expect(plan).toBeDefined();
    expect(plan?.metadata).toMatchObject({
      recoveryStrategy: 'fs-diagnostics',
      errorCategory: 'not-found',
    });
    expect(plan?.steps).toHaveLength(4);
    expect(plan?.steps[0]).toMatchObject({
      title: 'replan-fs-diagnostics',
      kind: 'tool',
      toolName: 'fs.list',
      input: {
        path: 'packages/core/src',
      },
    });
    expect(plan?.steps[1]?.dependsOn).toEqual([plan?.steps[0]?.id]);
    expect(plan?.steps[1]?.consumes).toMatchObject({
      fsDiagnostics: plan?.steps[0]?.id,
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

    const plan = await replanner.replan(ctx);
    expect(plan).toBeDefined();
    expect(plan?.metadata).toMatchObject({
      recoveryStrategy: 'shell-diagnostics',
      errorCategory: 'permission',
    });
    expect(plan?.steps).toHaveLength(4);
    expect(plan?.steps[0]).toMatchObject({
      title: 'replan-shell-diagnostics',
      kind: 'tool',
      toolName: 'shell.exec',
      input: {
        command: 'pwd',
      },
    });
    expect(plan?.steps[1]?.dependsOn).toEqual([plan?.steps[0]?.id]);
    expect(plan?.steps[1]?.consumes).toMatchObject({
      shellDiagnostics: plan?.steps[0]?.id,
    });
  });
});
