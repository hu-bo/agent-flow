import type { ToolDefinition, ToolRegistryLike } from '../../types/index.js';
export declare class ToolRegistry implements ToolRegistryLike {
    private readonly tools;
    register<TInput, TOutput>(tool: ToolDefinition<TInput, TOutput>): void;
    get(name: string): ToolDefinition | undefined;
    list(): ToolDefinition[];
}
//# sourceMappingURL=index.d.ts.map