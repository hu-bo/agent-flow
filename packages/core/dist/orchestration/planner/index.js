export { CodingReplanner } from './coding-replanner.js';
import { PlanningIntentResolver, extractRequestMessage } from './intent-resolver.js';
import { PlanFactory } from './plan-factory.js';
import { SemanticFsDetector } from './semantic-detector.js';
const semanticFsDetector = new SemanticFsDetector();
const intentResolver = new PlanningIntentResolver();
const planFactory = new PlanFactory();
export function detectSemanticToolStep(rawMessage) {
    return semanticFsDetector.detect(rawMessage);
}
export class CapabilityPlanner {
    options;
    constructor(options = {}) {
        this.options = options;
    }
    async plan(request, context) {
        const normalizedPlan = planFactory.normalize(request);
        if (normalizedPlan) {
            return normalizedPlan;
        }
        if (request.runnerCommand) {
            return planFactory.runner(request);
        }
        const semanticStep = detectSemanticToolStep(extractRequestMessage(request));
        const intent = intentResolver.resolve(request, context, semanticStep);
        const triageDecision = await this.triageWorkflow(request, context, semanticStep, intent);
        const shouldForceCoding = intent.wantsModification ||
            intent.wantsVerification ||
            intent.codingTaskType !== 'generic';
        if (triageDecision?.workflow === 'repo-understanding' && !shouldForceCoding) {
            return this.decoratePlan(planFactory.repoUnderstandingExecution(request, intent), triageDecision);
        }
        if (triageDecision?.workflow === 'coding' || intent.isCodingTask) {
            return this.decoratePlan(planFactory.codingExecution(request, intent, semanticStep), triageDecision);
        }
        if (semanticStep) {
            return this.decoratePlan(planFactory.toolFirstExecution(request, semanticStep, intent), triageDecision);
        }
        if (intent.shouldDecompose) {
            return this.decoratePlan(planFactory.decomposedExecution(request, intent), triageDecision);
        }
        return this.decoratePlan(planFactory.direct(request), triageDecision);
    }
    async triageWorkflow(request, context, semanticStep, intent) {
        if (!this.options.workflowTriageAgent) {
            return undefined;
        }
        try {
            return await this.options.workflowTriageAgent.triage({
                request,
                context,
                userMessage: extractRequestMessage(request),
                semanticToolCandidate: semanticStep
                    ? {
                        title: semanticStep.title,
                        toolName: semanticStep.toolName,
                        input: semanticStep.input,
                    }
                    : undefined,
                signals: {
                    wantsVerification: intent.wantsVerification,
                    complexityScore: intent.complexityScore,
                    shouldDecompose: intent.shouldDecompose,
                    isCodingTask: intent.isCodingTask,
                    codingTaskType: intent.codingTaskType,
                },
            });
        }
        catch {
            return undefined;
        }
    }
    decoratePlan(plan, triageDecision) {
        if (!triageDecision) {
            return plan;
        }
        return {
            ...plan,
            metadata: {
                ...(plan.metadata ?? {}),
                workflowTriage: {
                    workflow: triageDecision.workflow,
                    reason: triageDecision.reason,
                    agent: this.options.workflowTriageAgent?.name ?? 'workflow-triage-agent',
                },
            },
        };
    }
}
