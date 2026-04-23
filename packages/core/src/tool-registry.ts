import type { ToolDefinition, ToolResult } from './messages/index.js';

export type ToolExecutor = (input: unknown) => Promise<unknown>;

interface RegisteredTool {
  definition: ToolDefinition;
  execute: ToolExecutor;
}

/** ToolRegistry â€?manages tool registration and execution */
export class ToolRegistry {
  private tools = new Map<string, RegisteredTool>();

  register(definition: ToolDefinition, execute: ToolExecutor): void {
    this.tools.set(definition.name, { definition, execute });
  }

  getDefinitions(): ToolDefinition[] {
    return Array.from(this.tools.values()).map(t => t.definition);
  }

  async execute(toolName: string, toolCallId: string, input: unknown): Promise<ToolResult> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return { toolCallId, toolName, output: `Unknown tool: ${toolName}`, isError: true };
    }
    const start = Date.now();
    try {
      const output = await tool.execute(input);
      return { toolCallId, toolName, output, duration: Date.now() - start };
    } catch (error) {
      return {
        toolCallId,
        toolName,
        output: error instanceof Error ? error.message : String(error),
        isError: true,
        duration: Date.now() - start,
      };
    }
  }
}

