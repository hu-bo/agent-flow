import type { ToolDefinition } from '@agent-flow/model-contracts';

export type PermissionDecision = 'allow' | 'deny' | 'ask';

export interface PermissionPolicy {
  check(toolName: string, input: unknown): PermissionDecision;
}

export class DefaultPermissionPolicy implements PermissionPolicy {
  private allowList = new Set<string>();
  private denyList = new Set<string>();
  private userDecisions = new Map<string, 'allow' | 'deny'>();

  constructor(config?: { allow?: string[]; deny?: string[] }) {
    if (config?.allow) config.allow.forEach(t => this.allowList.add(t));
    if (config?.deny) config.deny.forEach(t => this.denyList.add(t));
  }

  check(toolName: string, _input: unknown): PermissionDecision {
    if (this.denyList.has(toolName)) return 'deny';
    if (this.allowList.has(toolName)) return 'allow';
    const cached = this.userDecisions.get(toolName);
    if (cached) return cached;
    return 'ask';
  }

  recordDecision(toolName: string, decision: 'allow' | 'deny', remember: boolean): void {
    if (remember) {
      this.userDecisions.set(toolName, decision);
    }
  }

  allowTool(toolName: string): void {
    this.allowList.add(toolName);
    this.denyList.delete(toolName);
  }

  denyTool(toolName: string): void {
    this.denyList.add(toolName);
    this.allowList.delete(toolName);
  }
}

export class PermissionManager {
  private policy: PermissionPolicy;
  private askHandler?: (toolName: string, input: unknown) => Promise<{ allow: boolean; remember: boolean }>;

  constructor(policy?: PermissionPolicy) {
    this.policy = policy ?? new DefaultPermissionPolicy();
  }

  setPolicy(policy: PermissionPolicy): void {
    this.policy = policy;
  }

  onAsk(handler: (toolName: string, input: unknown) => Promise<{ allow: boolean; remember: boolean }>): void {
    this.askHandler = handler;
  }

  async checkPermission(toolName: string, input: unknown): Promise<boolean> {
    const decision = this.policy.check(toolName, input);
    if (decision === 'allow') return true;
    if (decision === 'deny') return false;

    if (!this.askHandler) return true; // default allow if no handler

    const { allow, remember } = await this.askHandler(toolName, input);
    if (this.policy instanceof DefaultPermissionPolicy) {
      this.policy.recordDecision(toolName, allow ? 'allow' : 'deny', remember);
    }
    return allow;
  }
}
