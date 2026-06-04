import { describe, expect, it } from 'vitest';
import {
  type ToolContext,
  type ToolDefinition,
  type LlmStepRequest,
} from '../../packages/core/src/types/index.js';
import { ToolExecutor } from '../../packages/core/src/tools/executor/index.js';
import { ToolRegistry } from '../../packages/core/src/tools/registry/index.js';
import type {
  AdapterMessage,
  AdapterTokenUsage,
  GenerationRequest,
  GenerationResult,
  MessageTranslator,
  ModelAdapter,
  StreamEvent,
} from '@agent-flow/model-adapters/types';
import { ModelBackedLlmStepExecutor } from '../../apps/web-server/src/runtime/llm-step-executor.js';

const usage: AdapterTokenUsage = {
  inputTokens: 10,
  outputTokens: 5,
  totalTokens: 15,
};

const translator: MessageTranslator = {
  toProviderMessages(messages: AdapterMessage[]) {
    return messages;
  },
  fromProviderResponse(response: unknown, _parentId: string | null): AdapterMessage {
    return response as AdapterMessage;
  },
};

function createStepRequest(): LlmStepRequest {
  return {
    request: {
      goal: 'Inspect the repository before answering.',
      metadata: {
        modelId: 1,
        model: 'test-model',
        requestId: 'req_1',
        userId: 'user_1',
        cwd: '.',
      },
    },
    session: {
      id: 'core_session_1',
      taskId: 'task_1',
      status: 'running',
      createdAt: '2026-06-04T00:00:00.000Z',
      updatedAt: '2026-06-04T00:00:00.000Z',
      metadata: {},
    },
    step: {
      id: 'step_1',
      title: 'coding-analysis',
      kind: 'llm',
      dependsOn: [],
    },
    input: {
      mode: 'analysis',
    },
    context: {
      fragments: [],
      tokenBudget: 8000,
      tokenUsed: 0,
      truncated: false,
    },
    outputs: {},
  };
}

describe('ModelBackedLlmStepExecutor', () => {
  it('allows autonomous internal steps to call shell.exec through model tools', async () => {
    const generateRequests: GenerationRequest[] = [];
    const shellCalls: Array<{ input: unknown; context: ToolContext }> = [];
    const registry = new ToolRegistry();
    const shellTool: ToolDefinition<Record<string, unknown>, unknown> = {
      schema: {
        name: 'shell.exec',
        description: 'Execute a shell command.',
        input: {
          type: 'object',
          required: ['command'],
          properties: {
            command: { type: 'string' },
            args: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
      async execute(input: Record<string, unknown>, context: ToolContext): Promise<unknown> {
        shellCalls.push({ input, context });
        return {
          command: input.command,
          stdout: ['README.md', 'packages'],
          stderr: [],
        };
      },
    };
    registry.register(shellTool);
    const toolExecutor = new ToolExecutor(registry);

    const adapter: ModelAdapter = {
      provider: 'test-provider',
      translator,
      async generate(request: GenerationRequest): Promise<GenerationResult> {
        generateRequests.push(request);
        if (generateRequests.length === 1) {
          return {
            message: {
              id: 'assistant_tool_call',
              parentId: request.messages.at(-1)?.id ?? null,
              role: 'assistant',
              createdAt: '2026-06-04T00:00:00.000Z',
              parts: [
                {
                  type: 'tool-call',
                  callId: 'call_1',
                  toolName: 'shell_exec',
                  args: {
                    command: 'Get-ChildItem',
                    args: ['packages'],
                  },
                },
              ],
            },
            finishReason: 'tool-call',
            usage,
          };
        }

        expect(request.messages.at(-1)?.role).toBe('tool');
        return {
          message: {
            id: 'assistant_final',
            parentId: request.messages.at(-1)?.id ?? null,
            role: 'assistant',
            createdAt: '2026-06-04T00:00:00.000Z',
            parts: [
              {
                type: 'text',
                text: '{"analysis":"Saw README.md and packages via shell.","evidence":["shell.exec:Get-ChildItem packages"],"completionSignal":"COMPLETE"}',
              },
            ],
          },
          finishReason: 'stop',
          usage,
        };
      },
      async *stream(_request: GenerationRequest): AsyncIterable<StreamEvent> {
        yield {
          type: 'finish',
          finishReason: 'stop',
          usage,
        };
      },
      async estimateInputTokens(_messages: AdapterMessage[]): Promise<number> {
        return 10;
      },
    };

    const executor = new ModelBackedLlmStepExecutor(
      {
        async createAdapter() {
          return adapter;
        },
      } as never,
      {
        toolRegistry: registry,
        toolExecutor,
      },
    );

    const result = await executor.execute(createStepRequest());

    expect(generateRequests).toHaveLength(2);
    expect(generateRequests[0]?.tools?.map((tool) => tool.name)).toEqual(['shell_exec']);
    expect(shellCalls).toHaveLength(1);
    expect(shellCalls[0]?.input).toEqual({
      command: 'Get-ChildItem',
      args: ['packages'],
    });
    expect(shellCalls[0]?.context.stepId).toBe('step_1_tool_1_1');
    expect(result).toMatchObject({
      mode: 'llm-step',
      evidence: ['shell.exec:Get-ChildItem packages'],
      completionSignal: 'COMPLETE',
    });
  });
});
