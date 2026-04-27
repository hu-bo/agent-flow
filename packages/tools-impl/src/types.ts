import type { ToolDefinition, ToolRegistryLike } from '@agent-flow/core';

export interface RegisterBuiltinToolsOptions {
  cwd?: string;
  enableFileWrite?: boolean;
  blockedGitSubcommands?: string[];
}

export interface BuiltinToolRegistrationResult {
  registered: string[];
  skipped: string[];
}

export type BuiltinTool = ToolDefinition;
export type ToolRegistry = ToolRegistryLike;
