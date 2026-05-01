import type { ModelDescriptor } from '../contracts/api.js';
import type { AppDataSource } from '../db/data-source.js';
import { ProviderModelEntity } from '../db/entities/provider-model.entity.js';
import { RoutingPolicyEntity } from '../db/entities/routing-policy.entity.js';
import { NotFoundError } from '../lib/errors.js';
import {
  DEFAULT_POLICY_ID,
  DEFAULT_PROFILE_ID,
  type RoutingPolicyWriter,
  type SwitchModelOptions,
} from './model-admin-contracts.js';

export class ModelService {
  private currentModelId: number;
  private models: ModelDescriptor[] = [];
  private profilePrimaryModelIds = new Map<string, number>();
  private routingPolicyWriter?: RoutingPolicyWriter;

  constructor(
    private readonly db: AppDataSource,
    private readonly defaultModel: string,
  ) {
    this.currentModelId = 1;
  }

  async initialize(): Promise<void> {
    await this.refreshRuntimeModelCache();
  }

  setRoutingPolicyWriter(routingPolicyWriter: RoutingPolicyWriter) {
    this.routingPolicyWriter = routingPolicyWriter;
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

  resolveModelIdForProfile(profileId?: string) {
    if (!profileId) {
      return this.currentModelId;
    }

    const resolved = this.profilePrimaryModelIds.get(profileId);
    if (!resolved) {
      throw new NotFoundError(`Model profile is not configured or active: ${profileId}`);
    }
    return resolved;
  }

  getModel(modelId: number) {
    const descriptor = this.models.find((model) => model.modelId === modelId);
    if (!descriptor) {
      throw new NotFoundError(`Unknown model: ${modelId}`);
    }
    return descriptor;
  }

  async switchModel(modelId: number, options: SwitchModelOptions = {}) {
    if (!this.routingPolicyWriter) {
      throw new Error('RoutingPolicyWriter is not initialized');
    }

    const descriptor = this.getModel(modelId);
    const fallbackModelIds = this.models
      .map((model) => model.modelId)
      .filter((candidate) => candidate !== modelId);

    await this.routingPolicyWriter.upsertRoutingPolicy(
      DEFAULT_PROFILE_ID,
      {
        policyId: DEFAULT_POLICY_ID,
        primaryModelId: modelId,
        fallbacks: fallbackModelIds,
        strategy: 'priority',
        status: 'active',
      },
      {
        actorId: options.actorId,
        requestId: options.requestId,
        auditAction: 'model.switch',
      },
    );

    this.currentModelId = descriptor.modelId;
    return descriptor;
  }

  async refreshRuntimeModelCache(): Promise<void> {
    const providerModelRepository = this.db.getRepository(ProviderModelEntity);
    const routingPolicyRepository = this.db.getRepository(RoutingPolicyEntity);

    const models = await providerModelRepository.find({
      relations: {
        provider: true,
      },
      where: {
        status: 'active',
      },
      order: {
        modelId: 'ASC',
      },
    });

    const descriptors = models
      .filter((model) => model.provider.status === 'active')
      .map<ModelDescriptor>((model) => {
        const providerType = model.provider.type;
        return {
          modelId: model.modelId,
          model: `${providerType}/${model.model}`,
          displayName: model.displayName,
          provider: model.provider.name,
          providerType,
          providerModel: model.model,
          maxInputTokens: model.tokenLimit,
        };
      });

    this.models = descriptors.length ? descriptors : [createFallbackDescriptor(this.defaultModel)];

    const policies = await routingPolicyRepository.find({
      where: {
        status: 'active',
      },
      order: {
        profileId: 'ASC',
      },
    });
    const activeModelIds = new Set(this.models.map((model) => model.modelId));
    this.profilePrimaryModelIds = new Map(
      policies
        .filter((policy) => activeModelIds.has(policy.primaryModelId))
        .map((policy) => [policy.profileId, policy.primaryModelId]),
    );
    const policyPrimaryModelId = this.profilePrimaryModelIds.get(DEFAULT_PROFILE_ID);
    const resolvedCurrentModelId =
      policyPrimaryModelId &&
      this.models.some((model) => model.modelId === policyPrimaryModelId)
        ? policyPrimaryModelId
        : resolveDefaultModelId(this.models);

    this.currentModelId = resolvedCurrentModelId;
  }
}

function resolveDefaultModelId(models: Array<Pick<ModelDescriptor, 'modelId'>>) {
  return models[0]?.modelId ?? 1;
}

function createFallbackDescriptor(rawModel: string): ModelDescriptor {
  const { providerType, providerModel } = parseRuntimeModel(rawModel);
  return {
    modelId: 1,
    model: `${providerType}/${providerModel}`,
    displayName: providerModel,
    provider: providerType,
    providerType,
    providerModel,
    maxInputTokens: 128_000,
  };
}

function parseRuntimeModel(rawModel: string): { providerType: string; providerModel: string } {
  const [provider, ...rest] = rawModel.split('/');
  if (provider && rest.length > 0) {
    return {
      providerType: provider,
      providerModel: rest.join('/'),
    };
  }

  return {
    providerType: inferProvider(rawModel),
    providerModel: rawModel,
  };
}

function inferProvider(model: string): string {
  if (model.startsWith('gpt-') || model.startsWith('o1') || model.startsWith('o3')) {
    return 'openai';
  }
  if (model.startsWith('claude-')) {
    return 'anthropic';
  }
  if (model.startsWith('gemini-')) {
    return 'google';
  }
  if (model.startsWith('deepseek-')) {
    return 'deepseek';
  }
  return 'custom';
}
