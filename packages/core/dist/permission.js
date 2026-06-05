export class DefaultPermissionPolicy {
    allowList = new Set();
    denyList = new Set();
    userDecisions = new Map();
    constructor(config) {
        if (config?.allow)
            config.allow.forEach(t => this.allowList.add(t));
        if (config?.deny)
            config.deny.forEach(t => this.denyList.add(t));
    }
    check(toolName, _input) {
        if (this.denyList.has(toolName))
            return 'deny';
        if (this.allowList.has(toolName))
            return 'allow';
        const cached = this.userDecisions.get(toolName);
        if (cached)
            return cached;
        return 'ask';
    }
    recordDecision(toolName, decision, remember) {
        if (remember) {
            this.userDecisions.set(toolName, decision);
        }
    }
    allowTool(toolName) {
        this.allowList.add(toolName);
        this.denyList.delete(toolName);
    }
    denyTool(toolName) {
        this.denyList.add(toolName);
        this.allowList.delete(toolName);
    }
}
export class PermissionManager {
    policy;
    askHandler;
    constructor(policy) {
        this.policy = policy ?? new DefaultPermissionPolicy();
    }
    setPolicy(policy) {
        this.policy = policy;
    }
    onAsk(handler) {
        this.askHandler = handler;
    }
    async checkPermission(toolName, input) {
        const decision = this.policy.check(toolName, input);
        if (decision === 'allow')
            return true;
        if (decision === 'deny')
            return false;
        if (!this.askHandler)
            return true; // default allow if no handler
        const { allow, remember } = await this.askHandler(toolName, input);
        if (this.policy instanceof DefaultPermissionPolicy) {
            this.policy.recordDecision(toolName, allow ? 'allow' : 'deny', remember);
        }
        return allow;
    }
}
//# sourceMappingURL=permission.js.map