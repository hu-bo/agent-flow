import { generateText, streamText } from 'ai';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AiSdkAdapter } from './adapter.js';
vi.mock('ai', () => ({
    generateText: vi.fn(),
    streamText: vi.fn(),
    jsonSchema: vi.fn((schema) => schema),
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
        });
        const adapter = new AiSdkAdapter({}, 'test-provider');
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
        });
        const adapter = new AiSdkAdapter({}, 'test-provider', {
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
    it('does not switch protocols after stream parse failures', async () => {
        mockedStreamText.mockReturnValueOnce({
            fullStream: createAsyncStream([
                {
                    type: 'error',
                    error: createStreamParseError(),
                },
            ]),
        });
        const adapter = new AiSdkAdapter({}, 'test-provider');
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
        });
        const adapter = new AiSdkAdapter({}, 'test-provider');
        await expect(adapter.generate(createRequest())).rejects.toThrow('Connection timeout');
        expect(mockedStreamText).toHaveBeenCalledTimes(1);
        expect(mockedGenerateText).not.toHaveBeenCalled();
    });
});
function createRequest() {
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
async function* createAsyncStream(events) {
    for (const event of events) {
        yield event;
    }
}
