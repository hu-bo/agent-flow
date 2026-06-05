import type { UnifiedMessage } from '../messages/index.js';
export interface MicroCompactConfig {
    maxToolResultChars: number;
    headChars: number;
    tailChars: number;
    staleAfterTurns: number;
}
export declare const DEFAULT_MICRO_COMPACT_CONFIG: MicroCompactConfig;
export declare function microCompact(messages: UnifiedMessage[], currentTurn: number, config?: MicroCompactConfig): UnifiedMessage[];
//# sourceMappingURL=micro-compact.d.ts.map