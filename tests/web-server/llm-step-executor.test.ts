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
  it('allows autonomous internal steps to call semantic fs tools before shell.exec', async () => {
    const generateRequests: GenerationRequest[] = [];
    const fsSearchCalls: Array<{ input: unknown; context: ToolContext }> = [];
    const registry = new ToolRegistry();
    const fsListTool: ToolDefinition<Record<string, unknown>, unknown> = {
      schema: {
        name: 'fs.list',
        description: 'List workspace files.',
        input: {
          type: 'object',
          properties: {
            path: { type: 'string' },
          },
        },
      },
      async execute(input: Record<string, unknown>): Promise<unknown> {
        return {
          path: input.path ?? '.',
          entries: [],
          total: 0,
        };
      },
    };
    const fsReadTool: ToolDefinition<Record<string, unknown>, unknown> = {
      schema: {
        name: 'fs.read',
        description: 'Read a workspace file.',
        input: {
          type: 'object',
          required: ['path'],
          properties: {
            path: { type: 'string' },
          },
        },
      },
      async execute(input: Record<string, unknown>): Promise<unknown> {
        return {
          path: input.path,
          content: '',
          size: 0,
        };
      },
    };
    const fsSearchTool: ToolDefinition<Record<string, unknown>, unknown> = {
      schema: {
        name: 'fs.search',
        description: 'Search workspace files.',
        input: {
          type: 'object',
          required: ['pattern'],
          properties: {
            path: { type: 'string' },
            pattern: { type: 'string' },
          },
        },
      },
      async execute(input: Record<string, unknown>, context: ToolContext): Promise<unknown> {
        fsSearchCalls.push({ input, context });
        return {
          path: input.path ?? '.',
          pattern: input.pattern,
          matches: [{ path: 'README.md', line: 1, content: 'agent-flow' }],
          total: 1,
        };
      },
    };
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
      async execute(input: Record<string, unknown>): Promise<unknown> {
        return {
          command: input.command,
          stdout: ['README.md', 'packages'],
          stderr: [],
        };
      },
    };
    registry.register(fsListTool);
    registry.register(fsReadTool);
    registry.register(fsSearchTool);
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
                  toolName: 'fs_search',
                  args: {
                    path: '.',
                    pattern: 'agent-flow',
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
                text: '{"analysis":"Found README.md through fs.search.","evidence":["fs.search:agent-flow"],"completionSignal":"COMPLETE"}',
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
    expect(generateRequests[0]?.tools?.map((tool) => tool.name)).toEqual([
      'fs_list',
      'fs_read',
      'fs_search',
      'shell_exec',
    ]);
    expect(fsSearchCalls).toHaveLength(1);
    expect(fsSearchCalls[0]?.input).toEqual({
      path: '.',
      pattern: 'agent-flow',
    });
    expect(fsSearchCalls[0]?.context.stepId).toBe('step_1_tool_1_1');
    expect(result).toMatchObject({
      mode: 'llm-step',
      evidence: ['fs.search:agent-flow'],
      completionSignal: 'COMPLETE',
    });
  });
});
