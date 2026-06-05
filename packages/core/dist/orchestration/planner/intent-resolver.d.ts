import type { SemanticToolStep } from './semantic-detector.js';
import type { AgentRunRequest, ContextEnvelope } from '../../types/index.js';
export interface PlanningIntent {
    inspectionOnly: boolean;
    wantsModification: boolean;
    wantsVerification: boolean;
    complexityScore: number;
    shouldDecompose: boolean;
    isCodingTask: boolean;
    codingTaskType: 'bugfix' | 'feature' | 'refactor' | 'generic';
}
export declare function extractRequestMessage(request: AgentRunRequest): string;
export declare class PlanningIntentResolver {
    resolve(request: AgentRunRequest, context: ContextEnvelope, semanticStep?: SemanticToolStep): PlanningIntent;
    private detectCodingTask;
    private detectCodingTaskType;
    private calculateComplexityScore;
}
//# sourceMappingURL=intent-resolver.d.ts.map