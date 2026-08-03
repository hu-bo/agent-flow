export class ToolRegistry {
    tools = new Map();
    register(tool) {
        const name = tool.schema.name;
        if (this.tools.has(name)) {
            throw new Error(`Tool "${name}" already registered.`);
        }
        this.tools.set(name, tool);
    }
    get(name) {
        return this.tools.get(name);
    }
    list() {
        return [...this.tools.values()];
    }
}
