export type PermissionDecision = 'allow' | 'deny' | 'ask';
export interface PermissionPolicy {
    check(toolName: string, input: unknown): PermissionDecision;
}
export declare class DefaultPermissionPolicy implements PermissionPolicy {
    private allowList;
    private denyList;
    private userDecisions;
    constructor(config?: {
        allow?: string[];
        deny?: string[];
    });
    check(toolName: string, _input: unknown): PermissionDecision;
    recordDecision(toolName: string, decision: 'allow' | 'deny', remember: boolean): void;
    allowTool(toolName: string): void;
    denyTool(toolName: string): void;
}
export declare class PermissionManager {
    private policy;
    private askHandler?;
    constructor(policy?: PermissionPolicy);
    setPolicy(policy: PermissionPolicy): void;
    onAsk(handler: (toolName: string, input: unknown) => Promise<{
        allow: boolean;
        remember: boolean;
    }>): void;
    checkPermission(toolName: string, input: unknown): Promise<boolean>;
}
//# sourceMappingURL=permission.d.ts.map