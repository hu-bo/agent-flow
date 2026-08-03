import { describe, expect, it } from 'vitest';
import { createAgent } from './index.js';
const context = {
    fragments: [],
    tokenBudget: 8000,
    tokenUsed: 0,
    truncated: false
};
describe('createAgent runtime event forwarding', () => {
    it('forwards granular executor events through run onEvent once', async () => {
        const plan = {
            id: 'plan-runtime-trace',
            strategy: 'plan',
            completionContract: {
                objective: 'understand the project',
                maxRounds: 1,
                acceptance: { verifierName: 'generic', requiredEvidence: ['tool-success'] },
            },
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
        const planner = {
            async plan() {
                return plan;
            }
        };
        const toolExecutor = {
            async execute(call) {
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
        const observed = [];
        const result = await runtime.run({
            goal: 'understand the project'
        }, {
            async onEvent(event) {
                observed.push(event);
            }
        });
        expect(result.status).toBe('succeeded');
        expect(observed.map((event) => event.type)).toEqual([
            'session.started',
            'recovery.strategy_selected',
            'step.started',
            'tool.called',
            'tool.result',
            'checkpoint.created',
            'step.completed',
            'session.verification',
            'checkpoint.created',
            'session.completed'
        ]);
        expect(new Set(observed.map((event) => event.id)).size).toBe(observed.length);
    });
});
