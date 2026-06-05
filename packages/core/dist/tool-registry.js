/** ToolRegistry �?manages tool registration and execution */
export class ToolRegistry {
    tools = new Map();
    register(definition, execute) {
        this.tools.set(definition.name, { definition, execute });
    }
    getDefinitions() {
        return Array.from(this.tools.values()).map(t => t.definition);
    }
    async execute(toolName, toolCallId, input) {
        const tool = this.tools.get(toolName);
        if (!tool) {
            return { toolCallId, toolName, output: `Unknown tool: ${toolName}`, isError: true };
        }
        const start = Date.now();
        try {
            const output = await tool.execute(input);
            return { toolCallId, toolName, output, duration: Date.now() - start };
        }
        catch (error) {
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
//# sourceMappingURL=tool-registry.js.map