import type { ProviderAdapter, ModelInfo, ModelCapabilities } from '../messages/index.js';

export class ModelRouter {
  private adapters = new Map<string, ProviderAdapter>();
  private modelRegistry = new Map<string, ModelInfo>();

  registerAdapter(modelId: string, adapter: ProviderAdapter): void {
    this.adapters.set(modelId, adapter);
  }

  registerModel(model: ModelInfo): void {
    this.modelRegistry.set(model.modelId, model);
  }

  routeByName(modelId: string): ProviderAdapter | undefined {
    return this.adapters.get(modelId);
  }

  routeByCapability(requirements: Partial<ModelCapabilities>): ProviderAdapter | undefined {
    for (const [modelId, info] of this.modelRegistry) {
      const caps = info.capabilities;
      const matches = (Object.keys(requirements) as (keyof ModelCapabilities)[]).every(key => {
        const required = requirements[key];
        if (required === undefined) return true;
        if (typeof required === 'number') return (caps[key] as number) >= required;
        return caps[key] === required;
      });
      if (matches) return this.adapters.get(modelId);
    }
    return undefined;
  }

  routeByProvider(providerId: string): ProviderAdapter[] {
    return Array.from(this.adapters.values()).filter(a => a.providerId === providerId);
  }

  listModels(): ModelInfo[] {
    return Array.from(this.modelRegistry.values());
  }
}

