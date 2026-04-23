import type { ServerRuntime } from '../runtime.js';

export function switchModel(runtime: ServerRuntime, modelId: string): { model: string } {
  runtime.config.gateway.switchModel(modelId);
  return { model: modelId };
}

export function getHealth(runtime: ServerRuntime): { status: 'ok'; model: string } {
  return {
    status: 'ok',
    model: runtime.config.gateway.resolveModel(),
  };
}

export interface ModelDescriptor {
  modelId: string;
  displayName: string;
  provider: string;
  maxInputTokens: number;
}

export function getModels(runtime: ServerRuntime): {
  currentModel: string;
  models: ModelDescriptor[];
} {
  const currentModel = runtime.config.gateway.resolveModel();
  const registered = runtime.config.gateway.listRegisteredModels();
  const detailed = runtime.config.gateway.listModels();

  const byId = new Map(
    detailed.map((model) => [
      model.modelId,
      {
        modelId: model.modelId,
        displayName: model.displayName,
        provider: model.provider,
        maxInputTokens: model.capabilities.maxInputTokens,
      } satisfies ModelDescriptor,
    ]),
  );

  for (const model of registered) {
    if (!byId.has(model.modelId)) {
      byId.set(model.modelId, {
        modelId: model.modelId,
        displayName: model.modelId,
        provider: model.provider,
        maxInputTokens: 128000,
      });
    }
  }

  if (!byId.has(currentModel)) {
    byId.set(currentModel, {
      modelId: currentModel,
      displayName: currentModel,
      provider: 'unknown',
      maxInputTokens: 128000,
    });
  }

  const models = Array.from(byId.values()).sort((a, b) => a.displayName.localeCompare(b.displayName));
  return { currentModel, models };
}
