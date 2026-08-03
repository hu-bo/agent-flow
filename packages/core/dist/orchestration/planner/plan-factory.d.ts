import type { AgentPlan, AgentRunRequest } from '../../types/index.js';
import type { PlanningIntent } from './intent-resolver.js';
import type { SemanticToolStep } from './semantic-detector.js';
export declare class PlanFactory {
    normalize(request: AgentRunRequest): AgentPlan | undefined;
    runner(request: AgentRunRequest): AgentPlan;
    semanticInspection(request: AgentRunRequest, semanticStep: SemanticToolStep): AgentPlan;
    toolFirstExecution(request: AgentRunRequest, semanticStep: SemanticToolStep, intent: PlanningIntent): AgentPlan;
    repoUnderstandingExecution(request: AgentRunRequest, intent: PlanningIntent): AgentPlan;
    codingExecution(request: AgentRunRequest, intent: PlanningIntent, semanticStep?: SemanticToolStep): AgentPlan;
    decomposedExecution(request: AgentRunRequest, intent: PlanningIntent): AgentPlan;
    direct(request: AgentRunRequest): AgentPlan;
    private build;
}
