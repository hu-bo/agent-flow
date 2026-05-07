import { describe, expect, it } from 'vitest';
import { CapabilityPlanner, detectSemanticToolStep } from './index.js';
import type { ContextEnvelope } from '../../types/index.js';

const defaultContext: ContextEnvelope = {
  fragments: [],
  tokenBudget: 8000,
  tokenUsed: 0,
  truncated: false,
};

describe('detectSemanticToolStep', () => {
  it('returns undefined for empty input', () => {
    expect(detectSemanticToolStep('   ')).toBeUndefined();
  });

  it('detects fs.list intent for desktop query in chinese', () => {
    const step = detectSemanticToolStep('\u4f60\u80fd\u770b\u770b\u684c\u9762\u6709\u4ec0\u4e48\u6587\u4ef6\u5417');
    expect(step).toMatchObject({
      title: 'semantic-fs-list',
      toolName: 'fs.list',
      input: {
        path: '.',
      },
    });
  });

  it('detects fs.read intent with explicit path', () => {
    const step = detectSemanticToolStep('please read `packages/core/src/index.ts`');
    expect(step).toMatchObject({
      title: 'semantic-fs-read',
      toolName: 'fs.read',
      input: {
        path: 'packages/core/src/index.ts',
        maxBytes: 200000,
      },
    });
  });

  it('detects fs.search intent with recursive hint', () => {
    const step = detectSemanticToolStep('search "CapabilityPlanner" in packages/core recursively');
    expect(step).toMatchObject({
      title: 'semantic-fs-search',
      toolName: 'fs.search',
      input: {
        path: 'packages/core',
        pattern: 'CapabilityPlanner',
        recursive: true,
        maxMatches: 80,
      },
    });
  });
});

describe('CapabilityPlanner', () => {
  it('normalizes provided plans and fills missing step fields', async () => {
    const planner = new CapabilityPlanner();
    const plan = await planner.plan(
      {
        goal: 'run custom plan',
        strategy: 'react',
        plan: {
          id: '',
          strategy: 'plan',
          steps: [{ id: '', title: '', kind: 'llm', dependsOn: undefined as unknown as string[] }],
        },
      },
      defaultContext,
    );

    expect(plan.id).toMatch(/^plan_/);
    expect(plan.strategy).toBe('plan');
    expect(plan.steps).toHaveLength(1);
    expect(plan.steps[0]?.id).toMatch(/^step_/);
    expect(plan.steps[0]?.title).toBe('unnamed-step');
    expect(plan.steps[0]?.dependsOn).toEqual([]);
    expect(plan.steps[0]?.consumes).toEqual({});
  });

  it('builds a runner plan when runner command is provided', async () => {
    const planner = new CapabilityPlanner();
    const plan = await planner.plan(
      {
        goal: 'execute lint',
        strategy: 'plan',
        runnerCommand: 'pnpm',
        runnerArgs: ['lint'],
      },
      defaultContext,
    );

    expect(plan.steps).toHaveLength(1);
    expect(plan.steps[0]).toMatchObject({
      title: 'runner-execution',
      kind: 'runner',
      runner: {
        command: 'pnpm',
        args: ['lint'],
        stream: true,
      },
      input: {
        goal: 'execute lint',
      },
    });
  });

  it('uses single semantic tool step for inspection-only requests', async () => {
    const planner = new CapabilityPlanner();
    const plan = await planner.plan(
      {
        goal: 'show packages/core/src/index.ts',
        strategy: 'plan',
      },
      defaultContext,
    );

    expect(plan.steps).toHaveLength(1);
    expect(plan.steps[0]).toMatchObject({
      title: 'semantic-fs-read',
      kind: 'tool',
      toolName: 'fs.read',
    });
  });

  it('builds coding workflow plan for modification requests with semantic hint', async () => {
    const planner = new CapabilityPlanner();
    const plan = await planner.plan(
      {
        goal: 'read `packages/core/src/index.ts`, then fix it and test it',
        strategy: 'plan',
      },
      defaultContext,
    );

    expect(plan.steps).toHaveLength(5);
    expect(plan.steps[0]).toMatchObject({
      title: 'semantic-fs-read',
      kind: 'tool',
      toolName: 'fs.read',
    });
    expect(plan.steps[1]?.title).toBe('coding-analysis');
    expect(plan.steps[2]?.title).toBe('coding-implementation');
    expect(plan.steps[3]?.title).toBe('coding-bugfix-validation');
    expect(plan.steps[4]?.title).toBe('coding-validation');
    expect(plan.steps[1]?.dependsOn).toEqual([plan.steps[0]?.id]);
    expect(plan.steps[2]?.dependsOn).toEqual([plan.steps[1]?.id]);
    expect(plan.steps[3]?.dependsOn).toEqual([plan.steps[2]?.id]);
    expect(plan.steps[4]?.dependsOn).toEqual([plan.steps[3]?.id]);
    expect(plan.steps[2]?.consumes).toMatchObject({
      analysis: plan.steps[1]?.id,
      discovery: plan.steps[0]?.id,
    });
    expect(plan.steps[4]?.consumes).toMatchObject({
      implementation: plan.steps[2]?.id,
      taskValidation: plan.steps[3]?.id,
    });
  });

  it('builds coding workflow for feature implementation requests', async () => {
    const planner = new CapabilityPlanner();
    const plan = await planner.plan(
      {
        goal: 'implement login feature, add integration tests, then verify edge cases',
        strategy: 'plan',
      },
      defaultContext,
    );

    expect(plan.steps).toHaveLength(4);
    expect(plan.steps[0]?.title).toBe('coding-analysis');
    expect(plan.steps[1]?.title).toBe('coding-implementation');
    expect(plan.steps[2]?.title).toBe('coding-feature-validation');
    expect(plan.steps[3]?.title).toBe('coding-validation');
    expect(plan.steps[1]?.dependsOn).toEqual([plan.steps[0]?.id]);
    expect(plan.steps[2]?.dependsOn).toEqual([plan.steps[1]?.id]);
    expect(plan.steps[3]?.dependsOn).toEqual([plan.steps[2]?.id]);
    expect(plan.steps[0]?.input).toMatchObject({
      taskType: 'feature',
    });
  });

  it('classifies bugfix coding tasks in workflow metadata', async () => {
    const planner = new CapabilityPlanner();
    const plan = await planner.plan(
      {
        goal: 'fix failing test in session-service and verify regression',
        strategy: 'plan',
      },
      defaultContext,
    );

    expect(plan.steps).toHaveLength(4);
    expect(plan.steps[0]?.title).toBe('coding-analysis');
    expect(plan.steps[0]?.input).toMatchObject({
      taskType: 'bugfix',
    });
    expect(plan.steps[2]?.title).toBe('coding-bugfix-validation');
  });

  it('builds refactor workflow with behavior-preservation validation', async () => {
    const planner = new CapabilityPlanner();
    const plan = await planner.plan(
      {
        goal: 'refactor orchestration planner to reduce duplication and verify behavior',
        strategy: 'plan',
      },
      defaultContext,
    );

    expect(plan.steps).toHaveLength(4);
    expect(plan.steps[0]?.title).toBe('coding-analysis');
    expect(plan.steps[1]?.title).toBe('coding-implementation');
    expect(plan.steps[2]?.title).toBe('coding-refactor-validation');
    expect(plan.steps[3]?.title).toBe('coding-validation');
    expect(plan.steps[0]?.input).toMatchObject({
      taskType: 'refactor',
    });
  });

  it('falls back to direct llm reasoning for simple requests', async () => {
    const planner = new CapabilityPlanner();
    const plan = await planner.plan(
      {
        goal: 'summarize the architecture briefly',
        strategy: 'plan',
      },
      defaultContext,
    );

    expect(plan.steps).toHaveLength(1);
    expect(plan.steps[0]).toMatchObject({
      title: 'llm-reasoning',
      kind: 'llm',
      dependsOn: [],
      input: {
        goal: 'summarize the architecture briefly',
      },
    });
  });
});
