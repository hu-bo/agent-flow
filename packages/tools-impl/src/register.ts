import type { ToolRegistryLike } from '@agent-flow/core';
import { FileReadTool, FileWriteTool } from './fs-tools.js';
import { GitTool } from './git-tool.js';
import { HttpTool } from './http-tool.js';
import type { BuiltinTool, BuiltinToolRegistrationResult, RegisterBuiltinToolsOptions } from './types.js';

export function createBuiltinTools(options: RegisterBuiltinToolsOptions = {}): BuiltinTool[] {
  const tools: BuiltinTool[] = [new FileReadTool(), new GitTool({ cwd: options.cwd, blockedSubcommands: options.blockedGitSubcommands }), new HttpTool()];
  if (options.enableFileWrite !== false) {
    tools.push(new FileWriteTool());
  }
  return tools;
}

export function registerBuiltinTools(
  registry: ToolRegistryLike,
  options: RegisterBuiltinToolsOptions = {}
): BuiltinToolRegistrationResult {
  const registered: string[] = [];
  const skipped: string[] = [];

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
