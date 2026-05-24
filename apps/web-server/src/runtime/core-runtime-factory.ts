import {
  createAgent,
  type AgentRuntime,
  type LlmStepExecutorLike,
  type Runner,
  ToolExecutor,
  ToolRegistry,
} from '@agent-flow/core';
import { registerBuiltinTools } from '@agent-flow/tools-impl';
import { registerRunnerBackedTools } from '../services/runner-backed-tools.js';
import type { RunnerDispatchService } from '../services/runner-dispatch-service.js';

export interface CreateCoreAgentRuntimeOptions {
  cwd?: string;
  runners?: Runner[];
  runnerDispatchService?: RunnerDispatchService;
  llmExecutor?: LlmStepExecutorLike;
}

export interface CoreAgentRuntimeBundle {
  runtime: AgentRuntime;
  toolRegistry: ToolRegistry;
  toolExecutor: ToolExecutor;
}

export function createCoreAgentRuntimeBundle(options: CreateCoreAgentRuntimeOptions = {}): CoreAgentRuntimeBundle {
  const toolRegistry = new ToolRegistry();
  registerBuiltinTools(toolRegistry, {
    cwd: options.cwd ?? process.cwd(),
  });
  if (options.runnerDispatchService) {
    registerRunnerBackedTools(toolRegistry, options.runnerDispatchService);
  }
  const toolExecutor = new ToolExecutor(toolRegistry);
  const runtime = createAgent({
    toolRegistry,
    toolExecutor,
    runners: options.runners,
    llmExecutor: options.llmExecutor,
  });
  return {
    runtime,
    toolRegistry,
    toolExecutor,
  };
}

export function createCoreAgentRuntime(options: CreateCoreAgentRuntimeOptions = {}): AgentRuntime {
  return createCoreAgentRuntimeBundle(options).runtime;
}
