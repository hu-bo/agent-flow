import { describe, expect, it } from 'vitest';
import { CapabilityPlanner, detectSemanticToolStep } from './index.js';
const defaultContext = {
    fragments: [],
    tokenBudget: 8000,
    tokenUsed: 0,
    truncated: false,
};
function repoUnderstandingTriageAgent() {
    return {
        name: 'repo-understanding-triage',
        async triage() {
            return {
                workflow: 'repo-understanding',
                reason: 'The user is asking for repository understanding rather than code modification.',
            };
        },
    };
}
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
        const plan = await planner.plan({
            goal: 'run custom plan',
            strategy: 'react',
            plan: {
                id: '',
                strategy: 'plan',
                steps: [{ id: '', title: '', kind: 'llm', dependsOn: undefined }],
            },
        }, defaultContext);
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
        const plan = await planner.plan({
            goal: 'execute lint',
            strategy: 'plan',
            runnerCommand: 'pnpm',
            runnerArgs: ['lint'],
        }, defaultContext);
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
    it('builds tool-first execution for inspection-only requests', async () => {
        const planner = new CapabilityPlanner();
        const plan = await planner.plan({
            goal: 'show packages/core/src/index.ts',
            strategy: 'plan',
        }, defaultContext);
        expect(plan.steps).toHaveLength(2);
        expect(plan.steps[0]).toMatchObject({
            title: 'semantic-fs-read',
            kind: 'tool',
            toolName: 'fs.read',
        });
        expect(plan.steps[1]).toMatchObject({
            title: 'task-execution',
            kind: 'llm',
            dependsOn: [plan.steps[0]?.id],
            consumes: {
                discovery: plan.steps[0]?.id,
            },
        });
    });
    it('does not auto-route repository understanding questions without a triage agent', async () => {
        const planner = new CapabilityPlanner();
        const plan = await planner.plan({
            goal: '\u4f60\u7406\u89e3\u8fd9\u4e2a\u9879\u76ee\u662f\u505a\u4ec0\u4e48\u7684\u5417\uff1f',
            strategy: 'plan',
        }, defaultContext);
        expect(plan.steps).toHaveLength(1);
        expect(plan.steps[0]?.title).toBe('llm-reasoning');
    });
    it.each([
        '\u4f60\u4e86\u89e3\u8fd9\u4e2a\u9879\u76ee\u5417\uff1f',
        '\u4f60\u719f\u6089\u8fd9\u4e2a\u4ed3\u5e93\u5417\uff1f',
        '\u5e2e\u6211\u770b\u61c2\u8fd9\u4e2a\u4ee3\u7801\u5e93',
    ])('builds repo-understanding workflow when triage agent selects it for "%s"', async (goal) => {
        const planner = new CapabilityPlanner({
            workflowTriageAgent: repoUnderstandingTriageAgent(),
        });
        const plan = await planner.plan({
            goal,
            strategy: 'plan',
        }, defaultContext);
        expect(plan.metadata).toMatchObject({
            workflow: 'repo-understanding',
            workflowTriage: {
                workflow: 'repo-understanding',
                agent: 'repo-understanding-triage',
            },
        });
        expect(plan.completionContract).toMatchObject({
            maxRounds: 3,
            acceptance: {
                verifierName: 'repo-understanding',
            },
        });
        expect(plan.steps.map((step) => step.title)).toEqual([
            'repo.scan',
            'repo.read_readme',
            'repo.read_package_json',
            'repo.read_pnpm_workspace',
            'repo.read_turbo',
            'repo.analysis',
            'repo.summary',
        ]);
    });
    it('builds coding workflow plan for modification requests with semantic hint', async () => {
        const planner = new CapabilityPlanner();
        const plan = await planner.plan({
            goal: 'read `packages/core/src/index.ts`, then fix it and test it',
            strategy: 'plan',
        }, defaultContext);
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
    it('keeps modification requests in coding workflow even when triage agent would choose repo-understanding', async () => {
        const planner = new CapabilityPlanner({
            workflowTriageAgent: repoUnderstandingTriageAgent(),
        });
        const plan = await planner.plan({
            goal: '\u4fee\u6539\u8fd9\u4e2a\u9879\u76ee\u91cc\u7684 bug\uff0c\u5e76\u9a8c\u8bc1\u4fee\u590d\u7ed3\u679c',
            strategy: 'plan',
        }, defaultContext);
        expect(plan.metadata).toMatchObject({
            workflow: 'coding',
            taskType: 'bugfix',
        });
        expect(plan.steps[0]?.title).toBe('coding-analysis');
    });
    it('builds coding workflow for feature implementation requests', async () => {
        const planner = new CapabilityPlanner();
        const plan = await planner.plan({
            goal: 'implement login feature, add integration tests, then verify edge cases',
            strategy: 'plan',
        }, defaultContext);
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
        const plan = await planner.plan({
            goal: 'fix failing test in session-service and verify regression',
            strategy: 'plan',
        }, defaultContext);
        expect(plan.steps).toHaveLength(4);
        expect(plan.steps[0]?.title).toBe('coding-analysis');
        expect(plan.steps[0]?.input).toMatchObject({
            taskType: 'bugfix',
        });
        expect(plan.steps[2]?.title).toBe('coding-bugfix-validation');
    });
    it('builds refactor workflow with behavior-preservation validation', async () => {
        const planner = new CapabilityPlanner();
        const plan = await planner.plan({
            goal: 'refactor orchestration planner to reduce duplication and verify behavior',
            strategy: 'plan',
        }, defaultContext);
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
        const plan = await planner.plan({
            goal: 'summarize the architecture briefly',
            strategy: 'plan',
        }, defaultContext);
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
//# sourceMappingURL=index.test.js.map