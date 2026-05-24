import type { ToolExecutorLike, ToolRegistryLike } from '@agent-flow/core';
import type { ToolSpec } from '@agent-flow/model-adapters/types';
import type { RuntimeChatInput } from '../contracts/api.js';
import { parseApprovalRequiredErrorMessage } from '../lib/approval.js';
import { createToolResultOutputEnhancer } from '../tools/result-output-enhancer.js';
import { ApprovalRequiredError } from './approval-error.js';
import {
  INTERNAL_TOOL_NAME_BY_MODEL,
  MODEL_TOOL_NAME_BY_INTERNAL,
  isModelVisibleTool,
  toModelToolSchema,
} from './message-mappers.js';
import { buildToolContextMetadata } from './runtime-request-builder.js';
import type { ModelToolCall, ToolResultPart } from './runtime-types.js';
import { isPlainObject } from './runtime-types.js';

export class ModelToolRunner {
  constructor(
    private readonly toolRegistry?: ToolRegistryLike,
    private readonly toolExecutor?: ToolExecutorLike,
  ) {}

  getModelToolSpecs(): ToolSpec[] {
    if (!this.toolRegistry) {
      return [];
    }

    return this.toolRegistry
      .list()
      .filter(isModelVisibleTool)
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
    const internalToolName = INTERNAL_TOOL_NAME_BY_MODEL.get(toolCall.toolName) ?? toolCall.toolName;
    const toolInput = isPlainObject(toolCall.args) ? toolCall.args : {};
    const stepId = `model_tool_${index + 1}`;
    const metadata = buildToolContextMetadata(input);
    if (!this.toolExecutor) {
      return {
        type: 'tool-result',
        callId: toolCall.callId,
        toolName: toolCall.toolName,
        result: { error: 'Tool executor is not configured.' },
        isError: true,
      };
    }

    const outputEnhancer = await createToolResultOutputEnhancer({
      toolExecutor: this.toolExecutor,
      toolName: internalToolName,
      toolInput,
      toolContext: {
        taskId: input.requestId,
        sessionId: input.session.sessionId,
        stepId,
        metadata,
      },
    });

    const result = await this.toolExecutor.execute(
      {
        name: internalToolName,
        input: toolInput,
      },
      {
        taskId: input.requestId,
        sessionId: input.session.sessionId,
        stepId,
        metadata,
      },
      {
        retries: 0,
      },
    );
    if (!result.ok) {
      const approval = parseApprovalRequiredErrorMessage(result.error ?? '');
      if (approval) {
        throw new ApprovalRequiredError(approval);
      }
    }

    let output: unknown = result.ok ? result.output : { error: result.error ?? 'Tool execution failed.' };
    if (result.ok && outputEnhancer) {
      output = await outputEnhancer.finalize(output);
    }

    return {
      type: 'tool-result',
      callId: toolCall.callId,
      toolName: toolCall.toolName,
      result: output,
      isError: !result.ok,
    };
  }
}
