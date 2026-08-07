import type { LanguageModel } from 'ai';
import { generateText, streamText } from 'ai';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { GenerationRequest } from '../types/index.js';
import { AiSdkAdapter } from './adapter.js';

vi.mock('ai', () => ({
  generateText: vi.fn(),
  streamText: vi.fn(),
  jsonSchema: vi.fn((schema: unknown) => schema),
}));

const mockedGenerateText = vi.mocked(generateText);
const mockedStreamText = vi.mocked(streamText);

describe('AiSdkAdapter.generate', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('prioritizes stream parsing when stream succeeds', async () => {
    mockedStreamText.mockReturnValueOnce({
      fullStream: createAsyncStream([
        {
          type: 'text-delta',
          textDelta: 'stream first ok',
        },
        {
          type: 'finish',
          finishReason: 'stop',
          usage: {
            promptTokens: 21,
            completionTokens: 4,
          },
        },
      ]),
    } as unknown as ReturnType<typeof streamText>);

    const adapter = new AiSdkAdapter({} as LanguageModel, 'test-provider');
    const result = await adapter.generate(createRequest());

    expect(mockedStreamText).toHaveBeenCalledTimes(1);
    expect(mockedGenerateText).not.toHaveBeenCalled();
    expect(result.finishReason).toBe('stop');
    expect(result.usage).toEqual({
      inputTokens: 21,
      outputTokens: 4,
      totalTokens: 25,
    });
    expect(result.message.parts).toEqual([
      {
        type: 'text',
        text: 'stream first ok',
      },
    ]);
    expect(result.message.meta?.provider).toBe('test-provider');
    expect(result.message.meta?.model).toBe('openai/gpt-5.4');
  });

  it('uses non-stream generation only when explicitly configured', async () => {
    mockedGenerateText.mockResolvedValueOnce({
      text: 'non-stream configured ok',
      toolCalls: [],
      usage: {
        promptTokens: 30,
        completionTokens: 5,
      },
      finishReason: 'stop',
    } as unknown as Awaited<ReturnType<typeof generateText>>);

    const adapter = new AiSdkAdapter({} as LanguageModel, 'test-provider', {
      generationMode: 'nonstream',
    });
    const result = await adapter.generate(createRequest());

    expect(mockedStreamText).not.toHaveBeenCalled();
    expect(mockedGenerateText).toHaveBeenCalledTimes(1);
    expect(result.message.parts).toEqual([
      {
        type: 'text',
        text: 'non-stream configured ok',
      },
    ]);
    expect(result.usage).toEqual({
      inputTokens: 30,
      outputTokens: 5,
      totalTokens: 35,
    });
  });

  it('normalizes DSML textual tool calls in non-stream mode', async () => {
    mockedGenerateText.mockResolvedValueOnce({
      text: [
        'Need to inspect the workspace.',
        '<｜｜DSML｜｜tool_calls>',
        '<｜｜DSML｜｜invoke name="fs_read">',
        '<｜｜DSML｜｜parameter name="path" string="true">/workspace/synes-master/package.json</｜｜DSML｜｜parameter>',
        '</｜｜DSML｜｜invoke>',
        '</｜｜DSML｜｜tool_calls>',
      ].join(' '),
      toolCalls: [],
      usage: {
        promptTokens: 18,
        completionTokens: 7,
      },
      finishReason: 'stop',
    } as unknown as Awaited<ReturnType<typeof generateText>>);

    const adapter = new AiSdkAdapter({} as LanguageModel, 'deepseek', {
      generationMode: 'nonstream',
      textualToolCallFormat: 'dsml',
    });
    const result = await adapter.generate(createRequest());

    expect(result.finishReason).toBe('tool-call');
    expect(result.message.parts).toEqual([
      {
        type: 'text',
        text: 'Need to inspect the workspace.',
      },
      expect.objectContaining({
        type: 'tool-call',
        toolName: 'fs_read',
        args: {
          path: '/workspace/synes-master/package.json',
        },
      }),
    ]);
  });

  it('does not switch protocols after stream parse failures', async () => {
    mockedStreamText.mockReturnValueOnce({
      fullStream: createAsyncStream([
        {
          type: 'error',
          error: createStreamParseError(),
        },
      ]),
    } as unknown as ReturnType<typeof streamText>);

    const adapter = new AiSdkAdapter({} as LanguageModel, 'test-provider');
    await expect(adapter.generate(createRequest())).rejects.toThrow('JSON parsing failed');

    expect(mockedStreamText).toHaveBeenCalledTimes(1);
    expect(mockedGenerateText).not.toHaveBeenCalled();
  });

  it('rethrows non-fallback stream errors', async () => {
    const error = new Error('Connection timeout');
    mockedStreamText.mockReturnValueOnce({
      fullStream: createAsyncStream([
        {
          type: 'error',
          error,
        },
      ]),
    } as unknown as ReturnType<typeof streamText>);

    const adapter = new AiSdkAdapter({} as LanguageModel, 'test-provider');
    await expect(adapter.generate(createRequest())).rejects.toThrow('Connection timeout');

    expect(mockedStreamText).toHaveBeenCalledTimes(1);
    expect(mockedGenerateText).not.toHaveBeenCalled();
  });

  it('normalizes DSML textual tool calls while streaming', async () => {
    mockedStreamText.mockReturnValueOnce({
      fullStream: createAsyncStream([
        {
          type: 'text-delta',
          textDelta: 'Check docs ',
        },
        {
          type: 'text-delta',
          textDelta: '<｜｜DSML｜｜tool_calls><｜｜DSML｜｜invoke name="fs_list"><｜｜DSML｜｜parameter name="path" string="true">/workspace/synes-master/docs</｜｜DSML｜｜parameter></｜｜DSML｜｜invoke></｜｜DSML｜｜tool_calls>',
        },
        {
          type: 'finish',
          finishReason: 'stop',
          usage: {
            promptTokens: 22,
            completionTokens: 6,
          },
        },
      ]),
    } as unknown as ReturnType<typeof streamText>);

    const adapter = new AiSdkAdapter({} as LanguageModel, 'deepseek', {
      textualToolCallFormat: 'dsml',
    });
    const events: Array<Record<string, unknown>> = [];
    for await (const event of adapter.stream(createRequest())) {
      events.push(event as Record<string, unknown>);
    }

    expect(events).toEqual([
      {
        type: 'text-delta',
        delta: 'Check docs',
      },
      expect.objectContaining({
        type: 'tool-call-start',
        toolName: 'fs_list',
      }),
      expect.objectContaining({
        type: 'tool-call-end',
        toolName: 'fs_list',
        args: {
          path: '/workspace/synes-master/docs',
        },
      }),
      {
        type: 'finish',
        finishReason: 'tool-call',
        usage: {
          inputTokens: 22,
          outputTokens: 6,
          totalTokens: 28,
        },
      },
    ]);
  });
});

function createRequest(): GenerationRequest {
  return {
    model: 'openai/gpt-5.4',
    messages: [
      {
        id: 'u1',
        parentId: null,
        role: 'user',
        createdAt: '2026-05-26T00:00:00.000Z',
        parts: [{ type: 'text', text: 'hello' }],
      },
    ],
  };
}

function createStreamParseError() {
  return Object.assign(new Error('JSON parsing failed: Text is not valid JSON. Unexpected token \'{\''), {
    name: 'AI_JSONParseError',
    extra: {
      text: '{"id":"cmpl_123","choices":[]}',
    },
  });
}

async function* createAsyncStream(events: Array<Record<string, unknown>>) {
  for (const event of events) {
    yield event;
  }
}
