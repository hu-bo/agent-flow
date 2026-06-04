import {
  createAgent,
  type AgentRuntime,
  type LlmStepExecutorLike,
  type Runner,
  type CheckpointStore,
  type ReplayStore,
  type SessionStore,
  type WorkflowTriageAgent,
  ToolExecutor,
  ToolRegistry,
} from '@agent-flow/core';
import { registerBuiltinTools } from '@agent-flow/tools-impl';
import { registerRunnerBackedTools } from '../services/runner-backed-tools.js';
import type { RunnerDispatchService } from '../services/runner-dispatch-service.js';

export interface RuntimeToolBundle {
  toolRegistry: ToolRegistry;
  toolExecutor: ToolExecutor;
}

export interface CreateCoreAgentRuntimeOptions {
  cwd?: string;
  runners?: Runner[];
  runnerDispatchService?: RunnerDispatchService;
  llmExecutor?: LlmStepExecutorLike;
  createLlmExecutor?: (bundle: RuntimeToolBundle) => LlmStepExecutorLike;
  workflowTriageAgent?: WorkflowTriageAgent;
  sessionStore?: SessionStore;
  checkpointStore?: CheckpointStore;
  replayStore?: ReplayStore;
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
  const llmExecutor =
    options.llmExecutor ??
    options.createLlmExecutor?.({
      toolRegistry,
      toolExecutor,
    });
  const runtime = createAgent({
    toolRegistry,
    toolExecutor,
    runners: options.runners,
    llmExecutor,
    workflowTriageAgent: options.workflowTriageAgent,
    sessionStore: options.sessionStore,
    checkpointStore: options.checkpointStore,
    replayStore: options.replayStore,
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
