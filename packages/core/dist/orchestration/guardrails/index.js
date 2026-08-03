export class GuardrailChain {
    policies;
    constructor(policies) {
        this.policies = policies;
    }
    async runBefore(ctx) {
        for (const policy of this.policies) {
            if (policy.beforeStep) {
                await policy.beforeStep(ctx);
            }
        }
    }
    async runAfter(ctx) {
        for (const policy of this.policies) {
            if (policy.afterStep) {
                await policy.afterStep(ctx);
            }
        }
    }
}
const DEFAULT_BLOCKED_VERBS = ['rm', 'rmdir', 'del'];
export class CommandBlocklistGuardrail {
    name = 'command-blocklist';
    blockedVerbs;
    allowlistPatterns;
    constructor(options = {}) {
        this.blockedVerbs = options.blockedVerbs ?? DEFAULT_BLOCKED_VERBS;
        this.allowlistPatterns = options.commandAllowlistPatterns ?? [];
    }
    async beforeStep(ctx) {
        if (ctx.step.kind !== 'runner' || !ctx.step.runner) {
            return;
        }
        const command = ctx.step.runner.command.trim();
        if (!command) {
            return;
        }
        if (this.allowlistPatterns.some((pattern) => pattern.test(command))) {
            return;
        }
        const lowered = command.toLowerCase();
        for (const blockedVerb of this.blockedVerbs) {
            const rule = new RegExp(`\\b${blockedVerb}\\b`, 'i');
            if (rule.test(lowered)) {
                throw new Error(`Runner command blocked by guardrail: "${command}".`);
            }
        }
    }
}
