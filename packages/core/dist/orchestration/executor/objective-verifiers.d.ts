import type { AgentEvent, AgentPlan, CheckpointRecord, ContextEnvelope, ObjectiveVerificationResult, ObjectiveVerifier, AgentRunRequest, AgentSession } from '../../types/index.js';
export declare class ObjectiveVerifierRegistry {
    private readonly verifiers;
    constructor(verifiers?: ObjectiveVerifier[]);
    get(name: string): ObjectiveVerifier | undefined;
    verify(args: {
        plan: AgentPlan;
        request: AgentRunRequest;
        session: AgentSession;
        context: ContextEnvelope;
        outputs: Record<string, unknown>;
        checkpoints: CheckpointRecord[];
        events: AgentEvent[];
        round: number;
    }): Promise<ObjectiveVerificationResult | null>;
}
//# sourceMappingURL=objective-verifiers.d.ts.map