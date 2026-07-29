import type { ToolContext, ToolExecutorLike, ToolRegistryLike } from '@agent-flow/core';
import type { ToolSpec } from '@agent-flow/model-adapters/types';
import type { RuntimeChatInput } from '../contracts/api.js';
import { createToolResultOutputEnhancer } from '../tools/result-output-enhancer.js';
import {
  INTERNAL_TOOL_NAME_BY_MODEL,
  MODEL_TOOL_NAME_BY_INTERNAL,
  isModelVisibleTool,
  toModelToolSchema,
} from './message-mappers.js';
import { buildToolContextMetadata } from './runtime-request-builder.js';
import type { ModelToolCall, ToolResultPart } from './runtime-types.js';
import { isPlainObject } from './runtime-types.js';

interface ModelToolSpecOptions {
  internalToolNames?: readonly string[];
}

interface ModelToolExecutionInput {
  toolCall: ModelToolCall;
  stepId: string;
  context: ToolContext;
}

export class ModelToolRunner {
  constructor(
    private readonly toolRegistry?: ToolRegistryLike,
    private readonly toolExecutor?: ToolExecutorLike,
  ) {}

  getModelToolSpecs(options: ModelToolSpecOptions = {}): ToolSpec[] {
    if (!this.toolRegistry) {
      return [];
    }

    const allowed = options.internalToolNames ? new Set(options.internalToolNames) : undefined;
    return this.toolRegistry
      .list()
      .filter(isModelVisibleTool)
      .filter((tool) => !allowed || allowed.has(tool.schema.name))
      .map((tool) => ({
        name: MODEL_TOOL_NAME_BY_INTERNAL.get(tool.schema.name) ?? tool.schema.name,
        description: tool.schema.description,
        inputSchema: toModelToolSchema(tool.schema.input),
      }));
  }

  async executeModelToolCall(
    input: RuntimeChatInput,
    toolCall: ModelToolCall,
    index: number,
  ): Promise<ToolResultPart> {
    const stepId = `model_tool_${index + 1}`;
    const metadata = buildToolContextMetadata(input);
    return this.executeModelToolCallWithContext({
      toolCall,
      stepId,
      context: {
        taskId: input.requestId,
        sessionId: input.session.sessionId,
        stepId,
        signal: input.signal,
        metadata,
      },
    });
  }

  async executeModelToolCallWithContext(input: ModelToolExecutionInput): Promise<ToolResultPart> {
    const internalToolName = INTERNAL_TOOL_NAME_BY_MODEL.get(input.toolCall.toolName) ?? input.toolCall.toolName;
    const toolInput = isPlainObject(input.toolCall.args) ? input.toolCall.args : {};
    if (!this.toolExecutor) {
      return {
        type: 'tool-result',
        callId: input.toolCall.callId,
        toolName: input.toolCall.toolName,
        result: { error: 'Tool executor is not configured.' },
        isError: true,
      };
    }

    const outputEnhancer = await createToolResultOutputEnhancer({
      toolExecutor: this.toolExecutor,
      toolName: internalToolName,
      toolInput,
      toolContext: {
        ...input.context,
        stepId: input.stepId,
      },
    });

    await input.context.onEvent?.('tool.called', {
      tool: internalToolName,
      input: toolInput,
    });

    const result = await this.toolExecutor.execute(
      {
        name: internalToolName,
        input: toolInput,
      },
      {
        ...input.context,
        stepId: input.stepId,
      },
      {
        retries: 0,
      },
    );
    await input.context.onEvent?.('tool.result', {
      tool: internalToolName,
      ok: result.ok,
      error: result.error,
      output: result.output,
    });

    let output: unknown = result.ok ? result.output : { error: result.error ?? 'Tool execution failed.' };
    if (result.ok && outputEnhancer) {
      output = await outputEnhancer.finalize(output);
    }

    return {
      type: 'tool-result',
      callId: input.toolCall.callId,
      toolName: input.toolCall.toolName,
      result: output,
      isError: !result.ok,
    };
  }
}
