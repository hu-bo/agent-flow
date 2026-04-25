import type { ModelDescriptor } from '../contracts/api.js';
import { NotFoundError } from '../lib/errors.js';

const BUILT_IN_MODELS: ModelDescriptor[] = [
  {
    modelId: 'gpt-4o',
    displayName: 'GPT-4o',
    provider: 'openai',
    maxInputTokens: 128_000,
  },
  {
    modelId: 'gpt-4.1',
    displayName: 'GPT-4.1',
    provider: 'openai',
    maxInputTokens: 128_000,
  },
  {
    modelId: 'claude-sonnet-4-20250514',
    displayName: 'Claude Sonnet 4',
    provider: 'anthropic',
    maxInputTokens: 200_000,
  },
];

export class ModelService {
  private currentModelId: string;
  private readonly models: ModelDescriptor[];

  constructor(defaultModelId: string) {
    this.models = dedupeModels([...BUILT_IN_MODELS, createFallbackDescriptor(defaultModelId)]);
    this.currentModelId = defaultModelId;
  }

  listModels() {
    return [...this.models];
  }

  getCurrentModelId() {
    return this.currentModelId;
  }

  getCurrentModel() {
    return this.getModel(this.currentModelId);
  }

  getModel(modelId: string) {
    const descriptor = this.models.find((model) => model.modelId === modelId);
    if (!descriptor) {
      throw new NotFoundError(`Unknown model: ${modelId}`);
    }
    return descriptor;
  }

  switchModel(modelId: string) {
    const descriptor = this.getModel(modelId);
    this.currentModelId = descriptor.modelId;
    return descriptor;
  }
}

function dedupeModels(models: ModelDescriptor[]) {
  return Array.from(new Map(models.map((model) => [model.modelId, model])).values());
}

function createFallbackDescriptor(modelId: string): ModelDescriptor {
  return {
    modelId,
    displayName: modelId,
    provider: 'custom',
    maxInputTokens: 128_000,
  };
}
