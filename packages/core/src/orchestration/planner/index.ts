import type { AgentPlan, AgentRunRequest, AgentStep, ContextEnvelope, Planner } from '../../types/index.js';

let planCounter = 0;
let stepCounter = 0;

function nextPlanId(): string {
  planCounter += 1;
  return `plan_${Date.now()}_${planCounter}`;
}

function nextStepId(): string {
  stepCounter += 1;
  return `step_${Date.now()}_${stepCounter}`;
}

function normalizeStep(step: AgentStep): AgentStep {
  return {
    ...step,
    id: step.id || nextStepId(),
    title: step.title || step.id || 'unnamed-step',
    dependsOn: step.dependsOn ?? []
  };
}

export class StaticPlanner implements Planner {
  async plan(request: AgentRunRequest, _context: ContextEnvelope): Promise<AgentPlan> {
    if (request.plan) {
      return {
        ...request.plan,
        id: request.plan.id || nextPlanId(),
        strategy: request.plan.strategy || request.strategy || 'plan',
        steps: request.plan.steps.map((step) => normalizeStep(step))
      };
    }

    if (request.runnerCommand) {
      return {
        id: nextPlanId(),
        strategy: request.strategy ?? 'plan',
        steps: [
          {
            id: nextStepId(),
            title: 'runner-execution',
            kind: 'runner',
            dependsOn: [],
            runner: {
              command: request.runnerCommand,
              args: request.runnerArgs ?? [],
              stream: true
            },
            input: {
              goal: request.goal
            }
          }
        ]
      };
    }

    return {
      id: nextPlanId(),
      strategy: request.strategy ?? 'plan',
      steps: [
        {
          id: nextStepId(),
          title: 'llm-reasoning',
          kind: 'llm',
          dependsOn: [],
          input: {
            goal: request.goal
          }
        }
      ]
    };
  }
}
