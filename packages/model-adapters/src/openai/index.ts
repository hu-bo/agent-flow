import { createOpenAI, type OpenAIProviderSettings } from '@ai-sdk/openai';
import { AiSdkAdapter, type AiSdkGenerationMode } from '../ai-sdk/adapter.js';
import type { ModelAdapter } from '../types/index.js';

export interface OpenAiAdapterOptions extends OpenAIProviderSettings {
  model: string;
  providerId?: string;
  generationMode?: AiSdkGenerationMode;
  textualToolCallFormat?: 'dsml';
  apiVersion?: string;
}

export function createOpenAiAdapter(options: OpenAiAdapterOptions): ModelAdapter {
  const { model, providerId, generationMode, textualToolCallFormat, apiVersion, ...providerOptions } = options;
  const resolvedProviderOptions = apiVersion
    ? {
        ...providerOptions,
        fetch: withApiVersionQuery(providerOptions.fetch, apiVersion),
      }
    : providerOptions;
  const provider = createOpenAI(resolvedProviderOptions);
  return new AiSdkAdapter(provider(model), providerId ?? resolvedProviderOptions.name ?? 'openai', {
    generationMode,
    textualToolCallFormat,
  });
}

export function withApiVersionQuery(
  fetchImpl: OpenAIProviderSettings['fetch'] | undefined,
  apiVersion: string,
): NonNullable<OpenAIProviderSettings['fetch']> {
  const normalizedVersion = apiVersion.trim();
  const delegate = fetchImpl ?? globalThis.fetch?.bind(globalThis);

  if (!delegate) {
    throw new Error('Global fetch is unavailable for apiVersion-aware OpenAI adapters.');
  }

  return (input, init) => {
    const url = toUrlWithApiVersion(input, normalizedVersion);
    const nextInput = input instanceof Request ? new Request(url, input) : url;
    return delegate(nextInput, init);
  };
}

function toUrlWithApiVersion(input: RequestInfo | URL, apiVersion: string): URL {
  const rawUrl = input instanceof Request ? input.url : input instanceof URL ? input.toString() : String(input);
  const url = new URL(rawUrl);
  if (!url.searchParams.has('api-version')) {
    url.searchParams.set('api-version', apiVersion);
  }
  return url;
}
