import type { AgentPlan, AgentRunRequest, AgentStep } from '../../types/index.js';
import type { PlanningIntent } from './intent-resolver.js';
import type { SemanticToolStep } from './semantic-detector.js';

const STEP_TITLES = {
  runner: 'runner-execution',
  directReasoning: 'llm-reasoning',
  taskAnalysis: 'task-analysis',
  taskExecution: 'task-execution',
  solutionExecution: 'solution-execution',
  qualityVerification: 'quality-verification',
  solutionVerification: 'solution-verification',
  codingAnalysis: 'coding-analysis',
  codingImplementation: 'coding-implementation',
  codingBugfixValidation: 'coding-bugfix-validation',
  codingFeatureValidation: 'coding-feature-validation',
  codingRefactorValidation: 'coding-refactor-validation',
  codingValidation: 'coding-validation',
} as const;

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
    dependsOn: step.dependsOn ?? [],
    consumes: step.consumes ?? {},
  };
}

function resolveTaskSpecificValidationSpec(taskType: PlanningIntent['codingTaskType']): { title: string; mode: string } | undefined {
  if (taskType === 'bugfix') {
    return {
      title: STEP_TITLES.codingBugfixValidation,
      mode: 'regression-validation',
    };
  }
  if (taskType === 'feature') {
    return {
      title: STEP_TITLES.codingFeatureValidation,
      mode: 'acceptance-validation',
    };
  }
  if (taskType === 'refactor') {
    return {
      title: STEP_TITLES.codingRefactorValidation,
      mode: 'behavior-preservation-validation',
    };
  }
  return undefined;
}

export class PlanFactory {
  normalize(request: AgentRunRequest): AgentPlan | undefined {
    if (!request.plan) {
      return undefined;
    }

    return {
      ...request.plan,
      id: request.plan.id || nextPlanId(),
      strategy: request.plan.strategy || request.strategy || 'plan',
      steps: request.plan.steps.map((step) => normalizeStep(step)),
    };
  }

  runner(request: AgentRunRequest): AgentPlan {
    return this.build(request.strategy, [
      {
        id: nextStepId(),
        title: STEP_TITLES.runner,
        kind: 'runner',
        dependsOn: [],
        runner: {
          command: request.runnerCommand!,
          args: request.runnerArgs ?? [],
          stream: true,
        },
        input: {
          goal: request.goal,
        },
      },
    ]);
  }

  semanticInspection(request: AgentRunRequest, semanticStep: SemanticToolStep): AgentPlan {
    return this.build(request.strategy, [
      {
        id: nextStepId(),
        title: semanticStep.title,
        kind: 'tool',
        dependsOn: [],
        toolName: semanticStep.toolName,
        input: semanticStep.input,
      },
    ]);
  }

  toolFirstExecution(request: AgentRunRequest, semanticStep: SemanticToolStep, intent: PlanningIntent): AgentPlan {
    const discoverId = nextStepId();
    const executeId = nextStepId();

    const steps: AgentStep[] = [
      {
        id: discoverId,
        title: semanticStep.title,
        kind: 'tool',
        dependsOn: [],
        toolName: semanticStep.toolName,
        input: semanticStep.input,
      },
      {
        id: executeId,
        title: STEP_TITLES.taskExecution,
        kind: 'llm',
        dependsOn: [discoverId],
        input: {
          goal: request.goal,
          mode: 'tool-first',
          complexity: intent.complexityScore,
        },
      },
    ];

    if (intent.wantsVerification) {
      steps.push({
        id: nextStepId(),
        title: STEP_TITLES.qualityVerification,
        kind: 'llm',
        dependsOn: [executeId],
        input: {
          goal: request.goal,
          mode: 'verification',
        },
      });
    }

    return this.build(request.strategy, steps);
  }

  codingExecution(
    request: AgentRunRequest,
    intent: PlanningIntent,
    semanticStep?: SemanticToolStep
  ): AgentPlan {
    const steps: AgentStep[] = [];
    let discoveryStepId: string | undefined;

    if (semanticStep) {
      discoveryStepId = nextStepId();
      steps.push({
        id: discoveryStepId,
        title: semanticStep.title,
        kind: 'tool',
        dependsOn: [],
        toolName: semanticStep.toolName,
        input: semanticStep.input,
      });
    }

    const analysisStepId = nextStepId();
    const implementationStepId = nextStepId();
    const validationStepId = nextStepId();

    steps.push({
      id: analysisStepId,
      title: STEP_TITLES.codingAnalysis,
      kind: 'llm',
      dependsOn: discoveryStepId ? [discoveryStepId] : [],
      consumes: discoveryStepId
        ? {
            discovery: discoveryStepId,
          }
        : {},
      input: {
        goal: request.goal,
        mode: 'analysis',
        domain: 'software-engineering',
        taskType: intent.codingTaskType,
        complexity: intent.complexityScore,
      },
    });

    steps.push({
      id: implementationStepId,
      title: STEP_TITLES.codingImplementation,
      kind: 'llm',
      dependsOn: [analysisStepId],
      consumes: {
        analysis: analysisStepId,
        ...(discoveryStepId
          ? {
              discovery: discoveryStepId,
            }
          : {}),
      },
      input: {
        goal: request.goal,
        mode: 'implementation',
        domain: 'software-engineering',
        taskType: intent.codingTaskType,
      },
    });

    const taskSpecificValidationSpec = resolveTaskSpecificValidationSpec(intent.codingTaskType);
    let finalValidationDependsOn = implementationStepId;
    const finalValidationConsumes: Record<string, string> = {
      implementation: implementationStepId,
    };

    if (taskSpecificValidationSpec) {
      const taskSpecificValidationStepId = nextStepId();
      steps.push({
        id: taskSpecificValidationStepId,
        title: taskSpecificValidationSpec.title,
        kind: 'llm',
        dependsOn: [implementationStepId],
        consumes: {
          implementation: implementationStepId,
          analysis: analysisStepId,
        },
        input: {
          goal: request.goal,
          mode: taskSpecificValidationSpec.mode,
          domain: 'software-engineering',
          taskType: intent.codingTaskType,
        },
      });

      finalValidationDependsOn = taskSpecificValidationStepId;
      finalValidationConsumes.taskValidation = taskSpecificValidationStepId;
    }

    steps.push({
      id: validationStepId,
      title: STEP_TITLES.codingValidation,
      kind: 'llm',
      dependsOn: [finalValidationDependsOn],
      consumes: finalValidationConsumes,
      input: {
        goal: request.goal,
        mode: 'validation',
        domain: 'software-engineering',
        taskType: intent.codingTaskType,
        verifyDepth: intent.wantsVerification ? 'full' : 'standard',
      },
    });

    return this.build(request.strategy, steps);
  }

  decomposedExecution(request: AgentRunRequest, intent: PlanningIntent): AgentPlan {
    const analysisId = nextStepId();
    const executionId = nextStepId();

    const steps: AgentStep[] = [
      {
        id: analysisId,
        title: STEP_TITLES.taskAnalysis,
        kind: 'llm',
        dependsOn: [],
        input: {
          goal: request.goal,
          mode: 'analysis',
          strategy: request.strategy ?? 'plan',
          complexity: intent.complexityScore,
        },
      },
      {
        id: executionId,
        title: STEP_TITLES.solutionExecution,
        kind: 'llm',
        dependsOn: [analysisId],
        input: {
          goal: request.goal,
          mode: 'execution',
        },
      },
    ];

    if (intent.wantsVerification) {
      steps.push({
        id: nextStepId(),
        title: STEP_TITLES.solutionVerification,
        kind: 'llm',
        dependsOn: [executionId],
        input: {
          goal: request.goal,
          mode: 'verification',
        },
      });
    }

    return this.build(request.strategy, steps);
  }

  direct(request: AgentRunRequest): AgentPlan {
    return this.build(request.strategy, [
      {
        id: nextStepId(),
        title: STEP_TITLES.directReasoning,
        kind: 'llm',
        dependsOn: [],
        input: {
          goal: request.goal,
        },
      },
    ]);
  }

  private build(strategy: AgentRunRequest['strategy'], steps: AgentStep[]): AgentPlan {
    return {
      id: nextPlanId(),
      strategy: strategy ?? 'plan',
      steps,
    };
  }
}
