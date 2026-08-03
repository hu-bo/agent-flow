import type { GuardrailAfterContext, GuardrailBeforeContext, GuardrailPolicy, Guardrails } from '../../types/index.js';
export declare class GuardrailChain implements Guardrails {
    private readonly policies;
    constructor(policies: GuardrailPolicy[]);
    runBefore(ctx: GuardrailBeforeContext): Promise<void>;
    runAfter(ctx: GuardrailAfterContext): Promise<void>;
}
export interface CommandBlocklistGuardrailOptions {
    blockedVerbs?: string[];
    commandAllowlistPatterns?: RegExp[];
}
export declare class CommandBlocklistGuardrail implements GuardrailPolicy {
    readonly name = "command-blocklist";
    private readonly blockedVerbs;
    private readonly allowlistPatterns;
    constructor(options?: CommandBlocklistGuardrailOptions);
    beforeStep(ctx: GuardrailBeforeContext): Promise<void>;
}
