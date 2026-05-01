import type { AppDataSource } from '../db/data-source.js';
import { ModelProfileEntity } from '../db/entities/model-profile.entity.js';
import { ProviderModelEntity } from '../db/entities/provider-model.entity.js';
import { RoutingPolicyEntity } from '../db/entities/routing-policy.entity.js';
import { ConflictError, NotFoundError } from '../lib/errors.js';
import type {
  CreateModelProfileInput,
  ModelProfileRecord,
  RoutingPolicyRecord,
  SwitchModelOptions,
  UpdateModelProfileInput,
  UpsertRoutingPolicyInput,
  UpsertRoutingPolicyOptions,
} from './model-admin-contracts.js';
import { ModelAdminAuditService } from './model-admin-audit-service.js';

interface ProfilePolicyServiceOptions {
  onModelConfigChanged?: () => Promise<void>;
}

export class ProfilePolicyService {
  constructor(
    private readonly db: AppDataSource,
    private readonly auditService: ModelAdminAuditService,
    private readonly options: ProfilePolicyServiceOptions = {},
  ) {}

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
    const profileRecord = await this.db.transaction(async (manager) => {
      const profileRepository = manager.getRepository(ModelProfileEntity);
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

      const result = this.toModelProfileRecord(profile, null);
      await this.auditService.writeAuditLog(manager, options, {
        action: 'model_profile.create',
        resource: 'model_profile',
        resourceId: profile.profileId,
        before: null,
        after: result,
      });

      return result;
    });

    return profileRecord;
  }

  async updateModelProfile(
    profileId: string,
    input: UpdateModelProfileInput,
    options: SwitchModelOptions = {},
  ): Promise<ModelProfileRecord> {
    const result = await this.db.transaction(async (manager) => {
      const profileRepository = manager.getRepository(ModelProfileEntity);
      const routingPolicyRepository = manager.getRepository(RoutingPolicyEntity);
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
      const after = this.toModelProfileRecord(saved, currentPolicy ?? null);
      await this.auditService.writeAuditLog(manager, options, {
        action: 'model_profile.update',
        resource: 'model_profile',
        resourceId: saved.profileId,
        before,
        after,
      });

      return after;
    });

    return result;
  }

  async upsertRoutingPolicy(
    profileId: string,
    input: UpsertRoutingPolicyInput,
    options: UpsertRoutingPolicyOptions = {},
  ): Promise<RoutingPolicyRecord> {
    const result = await this.db.transaction(async (manager) => {
      const profileRepository = manager.getRepository(ModelProfileEntity);
      const routingPolicyRepository = manager.getRepository(RoutingPolicyEntity);
      const providerModelRepository = manager.getRepository(ProviderModelEntity);

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
        ? dedupeNumbers(input.fallbacks).filter((modelId) => modelId !== input.primaryModelId)
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
      const after = this.toRoutingPolicyRecord(saved);
      await this.auditService.writeAuditLog(manager, options, {
        action: options.auditAction ?? 'routing_policy.upsert',
        resource: 'routing_policy',
        resourceId: saved.policyId,
        before,
        after,
      });

      return after;
    });

    await this.notifyModelConfigChanged();
    return result;
  }

  private async notifyModelConfigChanged() {
    if (!this.options.onModelConfigChanged) {
      return;
    }
    await this.options.onModelConfigChanged();
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
}

function normalizeFallbacks(
  fallbacks: number[] | null | undefined,
  primaryModelId: number,
  knownModelIds: number[],
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

function dedupeNumbers(values: number[]) {
  return Array.from(new Set(values.filter((value) => Number.isInteger(value) && value > 0)));
}

function dedupeStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function toIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}
