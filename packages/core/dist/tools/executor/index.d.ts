import type { ToolCall, ToolContext, ToolExecuteOptions, ToolExecutorLike, ToolRegistryLike, ToolResult } from '../../types/index.js';
export declare class ToolExecutor implements ToolExecutorLike {
    private readonly registry;
    constructor(registry: ToolRegistryLike);
    execute(call: ToolCall, context: ToolContext, options?: ToolExecuteOptions): Promise<ToolResult>;
}
