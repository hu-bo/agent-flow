import type { AgentPlan, AgentRunRequest, ContextEnvelope, Planner } from '../../types/index.js';
export { CodingReplanner } from './coding-replanner.js';
import { PlanningIntentResolver, extractRequestMessage } from './intent-resolver.js';
import { PlanFactory } from './plan-factory.js';
import { SemanticFsDetector, type SemanticToolStep } from './semantic-detector.js';

const semanticFsDetector = new SemanticFsDetector();
const intentResolver = new PlanningIntentResolver();
const planFactory = new PlanFactory();

export type { SemanticToolStep };

export function detectSemanticToolStep(rawMessage: string): SemanticToolStep | undefined {
  return semanticFsDetector.detect(rawMessage);
}

export class CapabilityPlanner implements Planner {
  async plan(request: AgentRunRequest, context: ContextEnvelope): Promise<AgentPlan> {
    const normalizedPlan = planFactory.normalize(request);
    if (normalizedPlan) {
      return normalizedPlan;
    }

    if (request.runnerCommand) {
      return planFactory.runner(request);
    }

    const semanticStep = detectSemanticToolStep(extractRequestMessage(request));
    const intent = intentResolver.resolve(request, context, semanticStep);

    if (semanticStep && intent.inspectionOnly) {
      return planFactory.semanticInspection(request, semanticStep);
    }

    if (intent.isCodingTask) {
      return planFactory.codingExecution(request, intent, semanticStep);
    }

    if (semanticStep) {
      return planFactory.toolFirstExecution(request, semanticStep, intent);
    }

    if (intent.shouldDecompose) {
      return planFactory.decomposedExecution(request, intent);
    }

    return planFactory.direct(request);
  }
}
