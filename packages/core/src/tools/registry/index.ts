import type { ToolDefinition, ToolRegistryLike } from '../../types/index.js';

export class ToolRegistry implements ToolRegistryLike {
  private readonly tools = new Map<string, ToolDefinition>();

  register<TInput, TOutput>(tool: ToolDefinition<TInput, TOutput>): void {
    const name = tool.schema.name;
    if (this.tools.has(name)) {
      throw new Error(`Tool "${name}" already registered.`);
    }
    this.tools.set(name, tool as ToolDefinition);
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  list(): ToolDefinition[] {
    return [...this.tools.values()];
  }
}
