import { createOpenAI } from '@ai-sdk/openai';
import { AiSdkAdapter } from '../ai-sdk/adapter.js';
export function createOpenAiAdapter(options) {
    const { model, providerId, generationMode, ...providerOptions } = options;
    const provider = createOpenAI(providerOptions);
    return new AiSdkAdapter(provider(model), providerId ?? providerOptions.name ?? 'openai', {
        generationMode,
    });
}
