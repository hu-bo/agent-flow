import { describe, expect, it } from 'vitest';
import type {
  AdapterMessage,
  AdapterTokenUsage,
  GenerationRequest,
  GenerationResult,
  MessageTranslator,
  ModelAdapter,
  StreamEvent,
} from '@agent-flow/model-adapters/types';
import { ModelBackedWorkflowTriageAgent } from '../../apps/web-server/src/runtime/workflow-triage-agent.js';

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

function createAdapter(text: string): ModelAdapter {
  return {
    provider: 'test-provider',
    translator,
    async generate(_request: GenerationRequest): Promise<GenerationResult> {
      return {
        message: {
          id: 'msg_1',
          parentId: null,
          role: 'assistant',
          createdAt: '2026-06-02T00:00:00.000Z',
          parts: [{ type: 'text', text }],
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
}

describe('ModelBackedWorkflowTriageAgent', () => {
  it('parses repo-understanding decisions from model JSON', async () => {
    const agent = new ModelBackedWorkflowTriageAgent({
      async createAdapter() {
        return createAdapter('{"workflow":"repo-understanding","reason":"User wants a repository walkthrough."}');
      },
    } as never);

    const decision = await agent.triage({
      request: {
        goal: 'understand this repository',
        metadata: {
          modelId: 1,
          model: 'test-model',
          requestId: 'req_1',
          sessionId: 'sess_1',
        },
      },
      context: {
        fragments: [],
        tokenBudget: 8000,
        tokenUsed: 0,
        truncated: false,
      },
      userMessage: '你了解这个项目吗？',
      signals: {
        wantsVerification: false,
        complexityScore: 0,
        shouldDecompose: false,
        isCodingTask: false,
        codingTaskType: 'generic',
      },
    });

    expect(decision).toEqual({
      workflow: 'repo-understanding',
      reason: 'User wants a repository walkthrough.',
    });
  });

  it('returns undefined when model metadata is missing', async () => {
    const agent = new ModelBackedWorkflowTriageAgent({
      async createAdapter() {
        throw new Error('should not be called');
      },
    } as never);

    const decision = await agent.triage({
      request: {
        goal: 'understand this repository',
        metadata: {},
      },
      context: {
        fragments: [],
        tokenBudget: 8000,
        tokenUsed: 0,
        truncated: false,
      },
      userMessage: '你了解这个项目吗？',
      signals: {
        wantsVerification: false,
        complexityScore: 0,
        shouldDecompose: false,
        isCodingTask: false,
        codingTaskType: 'generic',
      },
    });

    expect(decision).toBeUndefined();
  });
});
