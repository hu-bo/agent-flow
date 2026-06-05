import type { ProviderAdapter, ModelInfo, ModelCapabilities } from '../messages/index.js';
export declare class ModelRouter {
    private adapters;
    private modelRegistry;
    registerAdapter(modelId: string, adapter: ProviderAdapter): void;
    registerModel(model: ModelInfo): void;
    routeByName(modelId: string): ProviderAdapter | undefined;
    routeByCapability(requirements: Partial<ModelCapabilities>): ProviderAdapter | undefined;
    routeByProvider(providerId: string): ProviderAdapter[];
    listModels(): ModelInfo[];
}
//# sourceMappingURL=router.d.ts.map