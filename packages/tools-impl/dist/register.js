import { GitTool } from './git-tool.js';
import { HttpTool } from './http-tool.js';
export function createBuiltinTools(options = {}) {
    return [new GitTool({ cwd: options.cwd, blockedSubcommands: options.blockedGitSubcommands }), new HttpTool()];
}
export function registerBuiltinTools(registry, options = {}) {
    const registered = [];
    const skipped = [];
    for (const tool of createBuiltinTools(options)) {
        if (registry.get(tool.schema.name)) {
            skipped.push(tool.schema.name);
            continue;
        }
        registry.register(tool);
        registered.push(tool.schema.name);
    }
    return {
        registered,
        skipped
    };
}
//# sourceMappingURL=register.js.map