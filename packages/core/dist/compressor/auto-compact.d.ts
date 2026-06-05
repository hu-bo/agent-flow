import type { UnifiedMessage, ModelCapabilities } from '../messages/index.js';
export interface AutoCompactConfig {
    triggerRatio: number;
    targetRatio: number;
    minMessageCount: number;
    maxRetries: number;
}
export declare const DEFAULT_AUTO_COMPACT_CONFIG: AutoCompactConfig;
export declare function shouldAutoCompact(messages: UnifiedMessage[], currentTokenCount: number, modelCapabilities: ModelCapabilities, config?: AutoCompactConfig): boolean;
//# sourceMappingURL=auto-compact.d.ts.map