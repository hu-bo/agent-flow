import { afterEach, describe, expect, it, vi } from 'vitest';
import { createOpenAiAdapter } from './index.js';

const { createOpenAIMock } = vi.hoisted(() => ({
  createOpenAIMock: vi.fn((_: unknown) => vi.fn(() => ({}) as never)),
}));

vi.mock('@ai-sdk/openai', () => ({
  createOpenAI: createOpenAIMock,
}));

describe('createOpenAiAdapter', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('adds api-version to compatible OpenAI fetch requests when configured', async () => {
    const upstreamFetch = vi.fn(async () => new Response(null, { status: 200 }));

    createOpenAiAdapter({
      model: 'gpt-5.4',
      apiKey: 'test-key',
      baseURL: 'https://example.openai.azure.com/openai/deployments/test',
      apiVersion: '2024-10-21',
      fetch: upstreamFetch,
    });

    const providerOptions = getCapturedProviderOptions();
    expect(providerOptions).toBeDefined();
    expect(providerOptions.fetch).toBeTypeOf('function');

    await providerOptions.fetch('https://example.openai.azure.com/openai/deployments/test/chat/completions');

    expect(upstreamFetch).toHaveBeenCalledTimes(1);
    expect(String(getFirstMockArgument(upstreamFetch))).toBe(
      'https://example.openai.azure.com/openai/deployments/test/chat/completions?api-version=2024-10-21',
    );
  });

  it('preserves an existing api-version query parameter', async () => {
    const upstreamFetch = vi.fn(async () => new Response(null, { status: 200 }));

    createOpenAiAdapter({
      model: 'gpt-5.4',
      apiKey: 'test-key',
      apiVersion: '2024-10-21',
      fetch: upstreamFetch,
    });

    const providerOptions = getCapturedProviderOptions();
    await providerOptions.fetch('https://example.com/v1/chat/completions?api-version=2024-02-01');

    expect(String(getFirstMockArgument(upstreamFetch))).toBe(
      'https://example.com/v1/chat/completions?api-version=2024-02-01',
    );
  });
});

function getCapturedProviderOptions(): {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
} {
  const firstCall = createOpenAIMock.mock.calls.at(0) as [unknown] | undefined;
  const providerOptions = firstCall?.[0] as {
    fetch?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  } | undefined;

  if (!providerOptions?.fetch) {
    throw new Error('Expected createOpenAI to receive a fetch implementation.');
  }

  return {
    fetch: providerOptions.fetch,
  };
}

function getFirstMockArgument(mockFn: ReturnType<typeof vi.fn>): unknown {
  const [firstCall] = mockFn.mock.calls;
  if (!firstCall) {
    throw new Error('Expected the mock to be called at least once.');
  }
  return firstCall[0];
}
