import type { ToolDefinition, ToolSchema } from '@agent-flow/core';
export interface GitToolOptions {
    cwd?: string;
    blockedSubcommands?: string[];
}
export interface GitExecInput {
    args: string[];
    timeoutMs?: number;
}
export interface GitExecOutput {
    stdout: string;
    stderr: string;
    exitCode: number;
}
export declare class GitTool implements ToolDefinition<GitExecInput, GitExecOutput> {
    readonly schema: ToolSchema;
    private readonly cwd;
    private readonly blockedSubcommands;
    constructor(options?: GitToolOptions);
    execute(input: GitExecInput): Promise<GitExecOutput>;
}
//# sourceMappingURL=git-tool.d.ts.map