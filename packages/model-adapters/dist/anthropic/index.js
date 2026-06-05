import { createAnthropic } from '@ai-sdk/anthropic';
import { AiSdkAdapter } from '../ai-sdk/adapter.js';
export function createAnthropicAdapter(options) {
    const { model, providerId, generationMode, ...providerOptions } = options;
    const provider = createAnthropic(providerOptions);
    return new AiSdkAdapter(provider(model), providerId ?? 'anthropic', {
        generationMode,
    });
}
//# sourceMappingURL=index.js.map