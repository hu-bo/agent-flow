import type { ToolDefinition, ToolResult } from './messages/index.js';
export type ToolExecutor = (input: unknown) => Promise<unknown>;
/** ToolRegistry �?manages tool registration and execution */
export declare class ToolRegistry {
    private tools;
    register(definition: ToolDefinition, execute: ToolExecutor): void;
    getDefinitions(): ToolDefinition[];
    execute(toolName: string, toolCallId: string, input: unknown): Promise<ToolResult>;
}
//# sourceMappingURL=tool-registry.d.ts.map