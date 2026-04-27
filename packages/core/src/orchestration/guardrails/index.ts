import type {
  GuardrailAfterContext,
  GuardrailBeforeContext,
  GuardrailPolicy,
  Guardrails
} from '../../types/index.js';

export class GuardrailChain implements Guardrails {
  constructor(private readonly policies: GuardrailPolicy[]) {}

  async runBefore(ctx: GuardrailBeforeContext): Promise<void> {
    for (const policy of this.policies) {
      if (policy.beforeStep) {
        await policy.beforeStep(ctx);
      }
    }
  }

  async runAfter(ctx: GuardrailAfterContext): Promise<void> {
    for (const policy of this.policies) {
      if (policy.afterStep) {
        await policy.afterStep(ctx);
      }
    }
  }
}

export interface CommandBlocklistGuardrailOptions {
  blockedVerbs?: string[];
  commandAllowlistPatterns?: RegExp[];
}

const DEFAULT_BLOCKED_VERBS = ['rm', 'rmdir', 'del'];

export class CommandBlocklistGuardrail implements GuardrailPolicy {
  readonly name = 'command-blocklist';
  private readonly blockedVerbs: string[];
  private readonly allowlistPatterns: RegExp[];

  constructor(options: CommandBlocklistGuardrailOptions = {}) {
    this.blockedVerbs = options.blockedVerbs ?? DEFAULT_BLOCKED_VERBS;
    this.allowlistPatterns = options.commandAllowlistPatterns ?? [];
  }

  async beforeStep(ctx: GuardrailBeforeContext): Promise<void> {
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
