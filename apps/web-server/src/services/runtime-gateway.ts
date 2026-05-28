import type {
  AgentRuntime,
  ToolExecutorLike,
  ToolRegistryLike,
} from '@agent-flow/core';
import type { StructuredLogger, Tracer } from '@agent-flow/events';
import type { MemoryService } from '@agent-flow/memory';
import {
  createCoreAgentRuntime,
  createCoreAgentRuntimeBundle,
  type CoreAgentRuntimeBundle,
  type CreateCoreAgentRuntimeOptions,
} from '../runtime/core-runtime-factory.js';
import { ModelBackedLlmStepExecutor } from '../runtime/llm-step-executor.js';
import { ModelChatDriver } from '../runtime/model-chat-driver.js';
import { ModelToolRunner } from '../runtime/model-tool-runner.js';
import { RuntimeTurnEngine } from '../runtime/runtime-turn-engine.js';
import type { ModelAdapterService } from './model-adapter-service.js';

export {
  createCoreAgentRuntime,
  createCoreAgentRuntimeBundle,
  ModelBackedLlmStepExecutor,
  type CoreAgentRuntimeBundle,
  type CreateCoreAgentRuntimeOptions,
};

export interface CoreRuntimeTurnEngineOptions {
  runtime: AgentRuntime;
  memoryService: MemoryService;
  modelAdapterService?: ModelAdapterService;
  toolRegistry?: ToolRegistryLike;
  toolExecutor?: ToolExecutorLike;
  logger?: StructuredLogger;
  tracer?: Tracer;
}

export function createCoreRuntimeTurnEngine(options: CoreRuntimeTurnEngineOptions): RuntimeTurnEngine {
  const modelToolRunner = new ModelToolRunner(options.toolRegistry, options.toolExecutor);
  const modelChatDriver = new ModelChatDriver(
    options.modelAdapterService,
    modelToolRunner,
    options.logger,
  );
  return new RuntimeTurnEngine({
    runtime: options.runtime,
    memoryService: options.memoryService,
    modelChatDriver,
    logger: options.logger,
    tracer: options.tracer,
  });
}
