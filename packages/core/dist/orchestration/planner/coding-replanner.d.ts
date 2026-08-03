import type { RecoveryDecision, ReplanContext, Replanner } from '../../types/index.js';
export declare class CodingReplanner implements Replanner {
    replan(ctx: ReplanContext): Promise<RecoveryDecision | undefined>;
}
