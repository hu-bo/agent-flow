import { describe, expect, it } from 'vitest';
import { detectSemanticToolStep, StaticPlanner } from './index.js';

describe('detectSemanticToolStep', () => {
  it('detects chinese list intent and maps to workspace listing', () => {
    const step = detectSemanticToolStep('\u4f60\u80fd\u770b\u770b\u684c\u9762\u6709\u4ec0\u4e48\u6587\u4ef6\u5417');

    expect(step).toBeDefined();
    expect(step?.toolName).toBe('fs.list');
    expect(step?.input).toMatchObject({
      path: '.',
      recursive: false,
      maxEntries: 200,
    });
  });

  it('detects english list intent', () => {
    const step = detectSemanticToolStep('list files in current directory');

    expect(step).toBeDefined();
    expect(step?.toolName).toBe('fs.list');
  });
});

describe('StaticPlanner', () => {
  it('creates semantic fs.list plan for chinese desktop query', async () => {
    const planner = new StaticPlanner();
    const plan = await planner.plan(
      {
        goal: 'User request:\n\u4f60\u80fd\u770b\u770b\u684c\u9762\u6709\u4ec0\u4e48\u6587\u4ef6\u5417',
        strategy: 'plan',
        metadata: {
          userMessage: '\u4f60\u80fd\u770b\u770b\u684c\u9762\u6709\u4ec0\u4e48\u6587\u4ef6\u5417',
        },
      },
      {
        fragments: [],
        tokenBudget: 8000,
        tokenUsed: 0,
        truncated: false,
      },
    );

    expect(plan.steps).toHaveLength(1);
    expect(plan.steps[0]?.kind).toBe('tool');
    expect(plan.steps[0]).toMatchObject({
      title: 'semantic-fs-list',
      toolName: 'fs.list',
      input: {
        path: '.',
      },
    });
  });
});
