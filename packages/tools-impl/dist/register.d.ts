import type { ToolRegistryLike } from '@agent-flow/core';
import type { BuiltinTool, BuiltinToolRegistrationResult, RegisterBuiltinToolsOptions } from './types.js';
export declare function createBuiltinTools(options?: RegisterBuiltinToolsOptions): BuiltinTool[];
export declare function registerBuiltinTools(registry: ToolRegistryLike, options?: RegisterBuiltinToolsOptions): BuiltinToolRegistrationResult;
