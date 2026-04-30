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
  private currentModelId: string;
  private models: ModelDescriptor[] = [];
  private profilePrimaryModelIds = new Map<string, string>();
  private routingPolicyWriter?: RoutingPolicyWriter;

  constructor(
    private readonly db: AppDataSource,
    private readonly defaultModelId: string,
  ) {
    this.currentModelId = defaultModelId;
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

  getModel(modelId: string) {
    const descriptor = this.models.find((model) => model.modelId === modelId);
    if (!descriptor) {
      throw new NotFoundError(`Unknown model: ${modelId}`);
    }
    return descriptor;
  }

  async switchModel(modelId: string, options: SwitchModelOptions = {}) {
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
      .map<ModelDescriptor>((model) => ({
        modelId: model.modelId,
        displayName: model.displayName,
        provider: model.provider.name,
        maxInputTokens: model.tokenLimit,
      }));

    this.models = descriptors.length
      ? descriptors
      : [createFallbackDescriptor(this.defaultModelId, inferProvider(this.defaultModelId))];

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
        : resolveDefaultModelId(this.models, this.defaultModelId);

    this.currentModelId = resolvedCurrentModelId;
  }
}

function resolveDefaultModelId(
  models: Array<Pick<ModelDescriptor, 'modelId'>>,
  defaultModelId: string,
) {
  if (models.some((model) => model.modelId === defaultModelId)) {
    return defaultModelId;
  }

  return models[0]?.modelId ?? defaultModelId;
}

function createFallbackDescriptor(
  modelId: string,
  provider = inferProvider(modelId),
): ModelDescriptor {
  return {
    modelId,
    displayName: modelId,
    provider,
    maxInputTokens: 128_000,
  };
}

function inferProvider(modelId: string): string {
  if (modelId.startsWith('gpt-') || modelId.startsWith('o1') || modelId.startsWith('o3')) {
    return 'openai';
  }
  if (modelId.startsWith('claude-')) {
    return 'anthropic';
  }
  if (modelId.startsWith('gemini-')) {
    return 'google';
  }
  if (modelId.startsWith('deepseek-')) {
    return 'deepseek';
  }
  return 'custom';
}
