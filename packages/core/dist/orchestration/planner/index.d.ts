import type { AgentPlan, AgentRunRequest, ContextEnvelope, Planner, WorkflowTriageAgent } from '../../types/index.js';
export { CodingReplanner } from './coding-replanner.js';
import { type SemanticToolStep } from './semantic-detector.js';
export type { SemanticToolStep };
export declare function detectSemanticToolStep(rawMessage: string): SemanticToolStep | undefined;
export interface CapabilityPlannerOptions {
    workflowTriageAgent?: WorkflowTriageAgent;
}
export declare class CapabilityPlanner implements Planner {
    private readonly options;
    constructor(options?: CapabilityPlannerOptions);
    plan(request: AgentRunRequest, context: ContextEnvelope): Promise<AgentPlan>;
    private triageWorkflow;
    private decoratePlan;
}
