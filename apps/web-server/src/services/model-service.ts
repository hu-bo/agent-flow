import 'reflect-metadata';
import { QueryFailedError } from 'typeorm';
import type { ModelDescriptor } from '../contracts/api.js';
import type { AppDataSource } from '../db/data-source.js';
import { AuditLogEntity } from '../db/entities/audit-log.entity.js';
import { ModelProfileEntity } from '../db/entities/model-profile.entity.js';
import { ProviderModelEntity } from '../db/entities/provider-model.entity.js';
import { ProviderCredentialEntity } from '../db/entities/provider-credential.entity.js';
import { ProviderEntity } from '../db/entities/provider.entity.js';
import { RoutingPolicyEntity } from '../db/entities/routing-policy.entity.js';
import { ConflictError, NotFoundError } from '../lib/errors.js';

const DEFAULT_PROFILE_ID = 'chat-default';
const DEFAULT_POLICY_ID = 'chat-default-policy';


export interface SwitchModelOptions {
  actorId?: string;
  requestId?: string;
}

export interface ListAdminModelsQuery {
  provider?: string;
}

export interface ListAuditLogsQuery {
  actor?: string;
  action?: string;
  resource?: string;
  limit?: number;
}

export interface CreateProviderInput {
  name: string;
  type: string;
  status?: 'active' | 'disabled';
  metadata?: Record<string, unknown> | null;
}

export interface UpdateProviderInput {
  status: 'active' | 'disabled';
}

export interface CreateProviderCredentialInput {
  secretRef: string;
  keyVersion?: number;
  status?: 'active' | 'disabled';
}

export interface UpdateProviderModelInput {
  displayName?: string;
  providerId?: number;
  tokenLimit?: number;
  status?: 'active' | 'disabled';
}

export interface CreateProviderModelInput {
  modelId: string;
  displayName: string;
  providerId: number;
  tokenLimit: number;
  status?: 'active' | 'disabled';
}

export interface CreateModelProfileInput {
  profileId: string;
  displayName: string;
  intentTags?: string[];
  sla?: Record<string, unknown> | null;
  status?: 'active' | 'disabled';
}

export interface UpdateModelProfileInput {
  displayName?: string;
  intentTags?: string[];
  sla?: Record<string, unknown> | null;
  status?: 'active' | 'disabled';
}

export interface UpsertRoutingPolicyInput {
  policyId?: string;
  primaryModelId: string;
  fallbacks?: string[];
  strategy?: string;
  status?: 'active' | 'disabled';
}

export interface ProviderRecord {
  providerId: number;
  name: string;
  type: string;
  status: 'active' | 'disabled';
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  activeModelCount: number;
  credentialCount: number;
}

export interface ProviderCredentialRecord {
  credentialId: string;
  providerId: number;
  secretRef: string;
  keyVersion: number;
  status: 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export interface ProviderModelRecord {
  modelId: string;
  displayName: string;
  providerId: number;
  providerName: string;
  providerType: string;
  providerStatus: 'active' | 'disabled';
  tokenLimit: number;
  status: 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export interface RoutingPolicyRecord {
  policyId: string;
  profileId: string;
  primaryModelId: string;
  fallbacks: string[];
  strategy: string;
  status: 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export interface ModelProfileRecord {
  profileId: string;
  displayName: string;
  intentTags: string[];
  sla: Record<string, unknown> | null;
  status: 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
  routingPolicy: RoutingPolicyRecord | null;
}

export interface AuditLogRecord {
  auditId: string;
  actor: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  requestId: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  createdAt: string;
}

interface AuditOptions {
  actorId?: string;
  requestId?: string;
  auditAction?: string;
}

export class ModelService {
  private currentModelId: string;
  private models: ModelDescriptor[] = [];
  private profilePrimaryModelIds = new Map<string, string>();

  constructor(
    private readonly db: AppDataSource,
    private readonly defaultModelId: string,
  ) {
    this.currentModelId = defaultModelId;
  }

  async initialize(): Promise<void> {
    await this.refreshCache();
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
    const descriptor = this.getModel(modelId);
    const fallbackModelIds = this.models
      .map((model) => model.modelId)
      .filter((candidate) => candidate !== modelId);

    await this.upsertRoutingPolicy(
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

  async listProviders(): Promise<ProviderRecord[]> {
    const providerRepository = this.db.getRepository(ProviderEntity);
    const providers = await providerRepository.find({
      relations: {
        models: true,
        credentials: true,
      },
      order: {
        name: 'ASC',
      },
    });

    return providers.map((provider) => this.toProviderRecord(provider));
  }

  async createProvider(
    input: CreateProviderInput,
    options: SwitchModelOptions = {},
  ): Promise<ProviderRecord> {
    const providerRepository = this.db.getRepository(ProviderEntity);
    const existing = await providerRepository.findOne({
      where: {
        name: input.name,
      },
    });
    if (existing) {
      throw new ConflictError(`Provider already exists: ${input.name}`);
    }

    const provider = await providerRepository.save(
      providerRepository.create({
        name: input.name,
        type: input.type,
        status: input.status ?? 'active',
        metadata: input.metadata ?? null,
      }),
    );

    // Enforce single-active-provider rule: if current provider is active,
    // demote every other active provider to disabled.
    if (provider.status === 'active') {
      await providerRepository
        .createQueryBuilder()
        .update(ProviderEntity)
        .set({ status: 'disabled' })
        .where('provider_id <> :providerId', { providerId: provider.providerId })
        .andWhere('status = :status', { status: 'active' })
        .execute();
    }

    await this.writeAuditLog(
      {
        actorId: options.actorId,
        requestId: options.requestId,
      },
      {
        action: 'provider.create',
        resource: 'provider',
        resourceId: String(provider.providerId),
        before: null,
        after: {
          name: provider.name,
          type: provider.type,
          status: provider.status,
        },
      },
    );

    return this.toProviderRecord(provider);
  }

  async updateProvider(
    providerId: number,
    input: UpdateProviderInput,
    options: SwitchModelOptions = {},
  ): Promise<ProviderRecord> {
    const providerRepository = this.db.getRepository(ProviderEntity);
    const provider = await providerRepository.findOne({
      where: {
        providerId,
      },
      relations: {
        models: true,
        credentials: true,
      },
    });
    if (!provider) {
      throw new NotFoundError(`Provider not found: ${providerId}`);
    }

    const before = this.toProviderRecord(provider);

    if (input.status === 'active') {
      await providerRepository
        .createQueryBuilder()
        .update(ProviderEntity)
        .set({ status: 'disabled' })
        .where('provider_id <> :providerId', { providerId })
        .andWhere('status = :status', { status: 'active' })
        .execute();
    }

    provider.status = input.status;
    await providerRepository.save(provider);
    const after = this.toProviderRecord(provider);

    await this.writeAuditLog(
      {
        actorId: options.actorId,
        requestId: options.requestId,
      },
      {
        action: 'provider.update',
        resource: 'provider',
        resourceId: String(providerId),
        before,
        after,
      },
    );

    await this.refreshCache();
    return after;
  }

  async deleteProvider(providerId: number, options: SwitchModelOptions = {}): Promise<void> {
    const providerRepository = this.db.getRepository(ProviderEntity);
    const routingPolicyRepository = this.db.getRepository(RoutingPolicyEntity);

    const provider = await providerRepository.findOne({
      where: {
        providerId,
      },
      relations: {
        models: true,
        credentials: true,
      },
    });
    if (!provider) {
      throw new NotFoundError(`Provider not found: ${providerId}`);
    }

    const modelIds = provider.models?.map((model) => model.modelId) ?? [];
    if (modelIds.length > 0) {
      const primaryBindings = await routingPolicyRepository
        .createQueryBuilder('policy')
        .where('policy.primary_model_id IN (:...modelIds)', {
          modelIds,
        })
        .orderBy('policy.profile_id', 'ASC')
        .getMany();

      if (primaryBindings.length > 0) {
        const profileIds = Array.from(new Set(primaryBindings.map((binding) => binding.profileId)));
        throw new ConflictError(
          `Provider "${provider.name}" cannot be deleted because its models are used as primary model by profile(s): ${profileIds.join(', ')}`,
        );
      }

      const modelIdSet = new Set(modelIds);
      const policies = await routingPolicyRepository.find();
      for (const policy of policies) {
        const fallbacks = normalizeStringArray(policy.fallbacks);
        const nextFallbacks = fallbacks.filter((modelId) => !modelIdSet.has(modelId));
        if (nextFallbacks.length === fallbacks.length) {
          continue;
        }
        policy.fallbacks = nextFallbacks;
        await routingPolicyRepository.save(policy);
      }
    }

    const before = this.toProviderRecord(provider);
    try {
      await providerRepository.delete({
        providerId,
      });
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictError(
          `Provider "${provider.name}" is still referenced and cannot be deleted.`,
        );
      }
      throw error;
    }

    await this.writeAuditLog(
      {
        actorId: options.actorId,
        requestId: options.requestId,
      },
      {
        action: 'provider.delete',
        resource: 'provider',
        resourceId: String(provider.providerId),
        before,
        after: null,
      },
    );

    await this.refreshCache();
  }

  async createProviderCredential(
    providerId: number,
    input: CreateProviderCredentialInput,
    options: SwitchModelOptions = {},
  ): Promise<ProviderCredentialRecord> {
    const providerRepository = this.db.getRepository(ProviderEntity);
    const credentialRepository = this.db.getRepository(ProviderCredentialEntity);
    const provider = await providerRepository.findOne({
      where: {
        providerId,
      },
    });

    if (!provider) {
      throw new NotFoundError(`Provider not found: ${providerId}`);
    }

    const existing = await credentialRepository.findOne({
      where: {
        providerId,
        secretRef: input.secretRef,
      },
    });
    if (existing) {
      throw new ConflictError(
        `Credential "${input.secretRef}" already exists for provider "${provider.name}"`,
      );
    }

    const credential = await credentialRepository.save(
      credentialRepository.create({
        providerId,
        secretRef: input.secretRef,
        keyVersion: input.keyVersion ?? 1,
        status: input.status ?? 'active',
      }),
    );

    await this.writeAuditLog(
      {
        actorId: options.actorId,
        requestId: options.requestId,
      },
      {
        action: 'provider_credential.create',
        resource: 'provider_credential',
        resourceId: credential.credentialId,
        before: null,
        after: {
          providerId: credential.providerId,
          secretRef: credential.secretRef,
          keyVersion: credential.keyVersion,
          status: credential.status,
        },
      },
    );

    return this.toProviderCredentialRecord(credential);
  }

  async listAdminModels(query: ListAdminModelsQuery = {}): Promise<ProviderModelRecord[]> {
    const providerModelRepository = this.db.getRepository(ProviderModelEntity);
    const builder = providerModelRepository
      .createQueryBuilder('model')
      .leftJoinAndSelect('model.provider', 'provider')
      .orderBy('model.modelId', 'ASC');

    if (query.provider) {
      builder.andWhere('(provider.name = :provider OR provider.type = :provider)', {
        provider: query.provider,
      });
    }

    const models = await builder.getMany();
    return models.map((model) => this.toProviderModelRecord(model));
  }

  async createAdminModel(
    input: CreateProviderModelInput,
    options: SwitchModelOptions = {},
  ): Promise<ProviderModelRecord> {
    const providerRepository = this.db.getRepository(ProviderEntity);
    const providerModelRepository = this.db.getRepository(ProviderModelEntity);

    const provider = await providerRepository.findOne({
      where: {
        providerId: input.providerId,
      },
    });
    if (!provider) {
      throw new NotFoundError(`Provider not found: ${input.providerId}`);
    }

    const existing = await providerModelRepository.findOne({
      where: {
        modelId: input.modelId,
      },
    });
    if (existing) {
      throw new ConflictError(`Model already exists: ${input.modelId}`);
    }

    const created = await providerModelRepository.save(
      providerModelRepository.create({
        modelId: input.modelId,
        displayName: input.displayName,
        providerId: input.providerId,
        tokenLimit: input.tokenLimit,
        status: input.status ?? 'active',
      }),
    );

    const createdWithProvider = await providerModelRepository.findOne({
      where: {
        modelId: created.modelId,
      },
      relations: {
        provider: true,
      },
    });
    if (!createdWithProvider) {
      throw new NotFoundError(`Model not found after create: ${created.modelId}`);
    }

    await this.writeAuditLog(
      {
        actorId: options.actorId,
        requestId: options.requestId,
      },
      {
        action: 'provider_model.create',
        resource: 'provider_model',
        resourceId: created.modelId,
        before: null,
        after: this.toProviderModelRecord(createdWithProvider),
      },
    );

    await this.refreshCache();
    return this.toProviderModelRecord(createdWithProvider);
  }

  async updateAdminModel(
    modelId: string,
    input: UpdateProviderModelInput,
    options: SwitchModelOptions = {},
  ): Promise<ProviderModelRecord> {
    const providerRepository = this.db.getRepository(ProviderEntity);
    const providerModelRepository = this.db.getRepository(ProviderModelEntity);
    const providerModel = await providerModelRepository.findOne({
      where: {
        modelId,
      },
      relations: {
        provider: true,
      },
    });

    if (!providerModel) {
      throw new NotFoundError(`Model not found: ${modelId}`);
    }

    const before = this.toProviderModelRecord(providerModel);
    if (input.displayName !== undefined) {
      providerModel.displayName = input.displayName;
    }
    if (input.providerId !== undefined) {
      const provider = await providerRepository.findOne({
        where: {
          providerId: input.providerId,
        },
      });
      if (!provider) {
        throw new NotFoundError(`Provider not found: ${input.providerId}`);
      }
      providerModel.providerId = provider.providerId;
      providerModel.provider = provider;
    }
    if (input.tokenLimit !== undefined) {
      providerModel.tokenLimit = input.tokenLimit;
    }
    if (input.status !== undefined) {
      providerModel.status = input.status;
    }

    const saved = await providerModelRepository.save(providerModel);
    const savedWithProvider = await providerModelRepository.findOne({
      where: {
        modelId: saved.modelId,
      },
      relations: {
        provider: true,
      },
    });
    if (!savedWithProvider) {
      throw new NotFoundError(`Model not found after update: ${saved.modelId}`);
    }
    await this.writeAuditLog(
      {
        actorId: options.actorId,
        requestId: options.requestId,
      },
      {
        action: 'provider_model.update',
        resource: 'provider_model',
        resourceId: saved.modelId,
        before,
        after: this.toProviderModelRecord(savedWithProvider),
      },
    );
    await this.refreshCache();
    return this.toProviderModelRecord(savedWithProvider);
  }

  async deleteAdminModel(modelId: string, options: SwitchModelOptions = {}): Promise<void> {
    const providerModelRepository = this.db.getRepository(ProviderModelEntity);
    const routingPolicyRepository = this.db.getRepository(RoutingPolicyEntity);

    const model = await providerModelRepository.findOne({
      where: {
        modelId,
      },
      relations: {
        provider: true,
      },
    });
    if (!model) {
      throw new NotFoundError(`Model not found: ${modelId}`);
    }

    const primaryBindings = await routingPolicyRepository.find({
      where: {
        primaryModelId: modelId,
      },
      order: {
        profileId: 'ASC',
      },
    });
    if (primaryBindings.length > 0) {
      const profileIds = primaryBindings.map((binding) => binding.profileId);
      throw new ConflictError(
        profileIds.length === 1
          ? `Model "${modelId}" is used as primary model by profile "${profileIds[0]}"`
          : `Model "${modelId}" is used as primary model by profiles: ${profileIds.join(', ')}`,
      );
    }

    const policies = await routingPolicyRepository.find();
    for (const policy of policies) {
      const fallbacks = normalizeStringArray(policy.fallbacks);
      if (!fallbacks.includes(modelId)) {
        continue;
      }
      policy.fallbacks = fallbacks.filter((item) => item !== modelId);
      await routingPolicyRepository.save(policy);
    }

    try {
      await providerModelRepository.delete({
        modelId,
      });
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        const bindings = await routingPolicyRepository.find({
          where: {
            primaryModelId: modelId,
          },
          order: {
            profileId: 'ASC',
          },
        });
        const profileIds = bindings.map((binding) => binding.profileId);
        const referenceHint =
          profileIds.length > 0
            ? ` Referenced by profile(s): ${profileIds.join(', ')}.`
            : '';
        throw new ConflictError(
          `Model "${modelId}" is still referenced by routing policy and cannot be deleted.${referenceHint}`,
        );
      }
      throw error;
    }

    await this.writeAuditLog(
      {
        actorId: options.actorId,
        requestId: options.requestId,
      },
      {
        action: 'provider_model.delete',
        resource: 'provider_model',
        resourceId: modelId,
        before: this.toProviderModelRecord(model),
        after: null,
      },
    );

    await this.refreshCache();
  }

  async listModelProfiles(): Promise<ModelProfileRecord[]> {
    const profileRepository = this.db.getRepository(ModelProfileEntity);
    const routingPolicyRepository = this.db.getRepository(RoutingPolicyEntity);
    const profiles = await profileRepository.find({
      order: {
        profileId: 'ASC',
      },
    });
    const policies = await routingPolicyRepository.find({
      order: {
        profileId: 'ASC',
      },
    });
    const policyByProfileId = new Map(policies.map((policy) => [policy.profileId, policy]));

    return profiles.map((profile) =>
      this.toModelProfileRecord(profile, policyByProfileId.get(profile.profileId) ?? null),
    );
  }

  async createModelProfile(
    input: CreateModelProfileInput,
    options: SwitchModelOptions = {},
  ): Promise<ModelProfileRecord> {
    const profileRepository = this.db.getRepository(ModelProfileEntity);
    const existing = await profileRepository.findOne({
      where: {
        profileId: input.profileId,
      },
    });
    if (existing) {
      throw new ConflictError(`Model profile already exists: ${input.profileId}`);
    }

    const profile = await profileRepository.save(
      profileRepository.create({
        profileId: input.profileId,
        displayName: input.displayName,
        intentTags: dedupeStrings(input.intentTags ?? []),
        sla: input.sla ?? null,
        status: input.status ?? 'active',
      }),
    );
    await this.writeAuditLog(
      {
        actorId: options.actorId,
        requestId: options.requestId,
      },
      {
        action: 'model_profile.create',
        resource: 'model_profile',
        resourceId: profile.profileId,
        before: null,
        after: this.toModelProfileRecord(profile, null),
      },
    );

    return this.toModelProfileRecord(profile, null);
  }

  async updateModelProfile(
    profileId: string,
    input: UpdateModelProfileInput,
    options: SwitchModelOptions = {},
  ): Promise<ModelProfileRecord> {
    const profileRepository = this.db.getRepository(ModelProfileEntity);
    const routingPolicyRepository = this.db.getRepository(RoutingPolicyEntity);
    const profile = await profileRepository.findOne({
      where: {
        profileId,
      },
    });
    if (!profile) {
      throw new NotFoundError(`Model profile not found: ${profileId}`);
    }

    const currentPolicy = await routingPolicyRepository.findOne({
      where: {
        profileId,
      },
    });
    const before = this.toModelProfileRecord(profile, currentPolicy ?? null);

    if (input.displayName !== undefined) {
      profile.displayName = input.displayName;
    }
    if (input.intentTags !== undefined) {
      profile.intentTags = dedupeStrings(input.intentTags);
    }
    if (input.sla !== undefined) {
      profile.sla = input.sla;
    }
    if (input.status !== undefined) {
      profile.status = input.status;
    }

    const saved = await profileRepository.save(profile);
    await this.writeAuditLog(
      {
        actorId: options.actorId,
        requestId: options.requestId,
      },
      {
        action: 'model_profile.update',
        resource: 'model_profile',
        resourceId: saved.profileId,
        before,
        after: this.toModelProfileRecord(saved, currentPolicy ?? null),
      },
    );
    return this.toModelProfileRecord(saved, currentPolicy ?? null);
  }

  async upsertRoutingPolicy(
    profileId: string,
    input: UpsertRoutingPolicyInput,
    options: AuditOptions = {},
  ): Promise<RoutingPolicyRecord> {
    const profileRepository = this.db.getRepository(ModelProfileEntity);
    const routingPolicyRepository = this.db.getRepository(RoutingPolicyEntity);
    const providerModelRepository = this.db.getRepository(ProviderModelEntity);

    const profile = await profileRepository.findOne({
      where: {
        profileId,
      },
    });
    if (!profile) {
      throw new NotFoundError(`Model profile not found: ${profileId}`);
    }

    const activeModels = await providerModelRepository.find({
      relations: {
        provider: true,
      },
      where: {
        status: 'active',
      },
    });

    const activeModelIds = activeModels
      .filter((model) => model.provider.status === 'active')
      .map((model) => model.modelId);

    if (!activeModelIds.includes(input.primaryModelId)) {
      throw new NotFoundError(`Primary model is not active or does not exist: ${input.primaryModelId}`);
    }

    const requestedFallbacks = input.fallbacks
      ? dedupeStrings(input.fallbacks).filter((modelId) => modelId !== input.primaryModelId)
      : undefined;
    const fallbackModelIds = normalizeFallbacks(
      requestedFallbacks,
      input.primaryModelId,
      activeModelIds,
    );

    const unknownFallbacks = fallbackModelIds.filter(
      (modelId) => !activeModelIds.includes(modelId),
    );
    if (unknownFallbacks.length > 0) {
      throw new NotFoundError(
        `Fallback model(s) are not active or do not exist: ${unknownFallbacks.join(', ')}`,
      );
    }

    let policy = await routingPolicyRepository.findOne({
      where: {
        profileId,
      },
    });
    const before = policy ? this.toRoutingPolicyRecord(policy) : null;

    if (!policy) {
      policy = routingPolicyRepository.create({
        policyId: input.policyId ?? `${profileId}-policy`,
        profileId,
        primaryModelId: input.primaryModelId,
        fallbacks: fallbackModelIds,
        strategy: input.strategy ?? 'priority',
        status: input.status ?? 'active',
      });
    } else {
      policy.primaryModelId = input.primaryModelId;
      policy.fallbacks = fallbackModelIds;
      if (input.strategy !== undefined) {
        policy.strategy = input.strategy;
      }
      if (input.status !== undefined) {
        policy.status = input.status;
      }
    }

    const saved = await routingPolicyRepository.save(policy);
    await this.writeAuditLog(
      {
        actorId: options.actorId,
        requestId: options.requestId,
      },
      {
        action: options.auditAction ?? 'routing_policy.upsert',
        resource: 'routing_policy',
        resourceId: saved.policyId,
        before,
        after: this.toRoutingPolicyRecord(saved),
      },
    );

    await this.refreshCache();
    return this.toRoutingPolicyRecord(saved);
  }

  async listAuditLogs(query: ListAuditLogsQuery = {}): Promise<AuditLogRecord[]> {
    const auditLogRepository = this.db.getRepository(AuditLogEntity);
    const builder = auditLogRepository
      .createQueryBuilder('audit')
      .orderBy('audit.created_at', 'DESC')
      .take(Math.min(Math.max(query.limit ?? 50, 1), 200));

    if (query.actor) {
      builder.andWhere('audit.actor = :actor', {
        actor: query.actor,
      });
    }
    if (query.action) {
      builder.andWhere('audit.action = :action', {
        action: query.action,
      });
    }
    if (query.resource) {
      builder.andWhere('audit.resource = :resource', {
        resource: query.resource,
      });
    }

    const logs = await builder.getMany();
    return logs.map((log) => this.toAuditLogRecord(log));
  }


  private async refreshCache(): Promise<void> {
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

  private async writeAuditLog(
    options: SwitchModelOptions,
    payload: {
      action: string;
      resource: string;
      resourceId?: string | null;
      before?: unknown;
      after?: unknown;
    },
  ) {
    const auditLogRepository = this.db.getRepository(AuditLogEntity);
    await auditLogRepository.save(
      auditLogRepository.create({
        actor: options.actorId ?? null,
        action: payload.action,
        resource: payload.resource,
        resourceId: payload.resourceId ?? null,
        requestId: options.requestId ?? null,
        before: normalizeAuditValue(payload.before),
        after: normalizeAuditValue(payload.after),
      }),
    );
  }

  private toProviderRecord(provider: ProviderEntity): ProviderRecord {
    const activeModelCount = provider.models?.filter((model) => model.status === 'active').length ?? 0;
    const credentialCount = provider.credentials?.length ?? 0;
    return {
      providerId: provider.providerId,
      name: provider.name,
      type: provider.type,
      status: provider.status,
      metadata: provider.metadata,
      createdAt: toIso(provider.createdAt),
      updatedAt: toIso(provider.updatedAt),
      activeModelCount,
      credentialCount,
    };
  }

  private toProviderCredentialRecord(
    credential: ProviderCredentialEntity,
  ): ProviderCredentialRecord {
    return {
      credentialId: credential.credentialId,
      providerId: credential.providerId,
      secretRef: credential.secretRef,
      keyVersion: credential.keyVersion,
      status: credential.status,
      createdAt: toIso(credential.createdAt),
      updatedAt: toIso(credential.updatedAt),
    };
  }

  private toProviderModelRecord(model: ProviderModelEntity): ProviderModelRecord {
    return {
      modelId: model.modelId,
      displayName: model.displayName,
      providerId: model.providerId,
      providerName: model.provider?.name ?? 'unknown',
      providerType: model.provider?.type ?? 'unknown',
      providerStatus: model.provider?.status ?? 'disabled',
      tokenLimit: model.tokenLimit,
      status: model.status,
      createdAt: toIso(model.createdAt),
      updatedAt: toIso(model.updatedAt),
    };
  }

  private toRoutingPolicyRecord(policy: RoutingPolicyEntity): RoutingPolicyRecord {
    return {
      policyId: policy.policyId,
      profileId: policy.profileId,
      primaryModelId: policy.primaryModelId,
      fallbacks: policy.fallbacks ?? [],
      strategy: policy.strategy,
      status: policy.status,
      createdAt: toIso(policy.createdAt),
      updatedAt: toIso(policy.updatedAt),
    };
  }

  private toModelProfileRecord(
    profile: ModelProfileEntity,
    routingPolicy: RoutingPolicyEntity | null,
  ): ModelProfileRecord {
    return {
      profileId: profile.profileId,
      displayName: profile.displayName,
      intentTags: profile.intentTags ?? [],
      sla: profile.sla,
      status: profile.status,
      createdAt: toIso(profile.createdAt),
      updatedAt: toIso(profile.updatedAt),
      routingPolicy: routingPolicy ? this.toRoutingPolicyRecord(routingPolicy) : null,
    };
  }

  private toAuditLogRecord(log: AuditLogEntity): AuditLogRecord {
    return {
      auditId: log.auditId,
      actor: log.actor,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      requestId: log.requestId,
      before: log.before,
      after: log.after,
      createdAt: toIso(log.createdAt),
    };
  }
}

function dedupeModels(models: ModelDescriptor[]) {
  return Array.from(new Map(models.map((model) => [model.modelId, model])).values());
}

function resolveDefaultModelId(models: Array<Pick<ModelDescriptor, 'modelId'>>, defaultModelId: string) {
  if (models.some((model) => model.modelId === defaultModelId)) {
    return defaultModelId;
  }

  return models[0]?.modelId ?? defaultModelId;
}

function normalizeFallbacks(
  fallbacks: string[] | null | undefined,
  primaryModelId: string,
  knownModelIds: string[],
) {
  const fallbackSet = new Set(
    (fallbacks ?? []).filter(
      (modelId) => modelId !== primaryModelId && knownModelIds.includes(modelId),
    ),
  );
  if (fallbackSet.size > 0) {
    return [...fallbackSet];
  }

  return knownModelIds.filter((modelId) => modelId !== primaryModelId);
}

function dedupeStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function createFallbackDescriptor(modelId: string, provider = inferProvider(modelId)): ModelDescriptor {
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

function toIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}

function normalizeAuditValue(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function isForeignKeyViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  const driverError = (error as QueryFailedError & { driverError?: { code?: string } }).driverError;
  return driverError?.code === '23503';
}
