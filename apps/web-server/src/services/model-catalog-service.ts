import { QueryFailedError } from 'typeorm';
import type { AppDataSource } from '../db/data-source.js';
import { ProviderEntity } from '../db/entities/provider.entity.js';
import { ProviderModelEntity } from '../db/entities/provider-model.entity.js';
import { RoutingPolicyEntity } from '../db/entities/routing-policy.entity.js';
import { ConflictError, NotFoundError } from '../lib/errors.js';
import type {
  CreateProviderModelInput,
  ListAdminModelsQuery,
  ProviderModelRecord,
  SwitchModelOptions,
  UpdateProviderModelInput,
} from './model-admin-contracts.js';
import { ModelAdminAuditService } from './model-admin-audit-service.js';

interface ModelCatalogServiceOptions {
  onModelConfigChanged?: () => Promise<void>;
}

export class ModelCatalogService {
  constructor(
    private readonly db: AppDataSource,
    private readonly auditService: ModelAdminAuditService,
    private readonly options: ModelCatalogServiceOptions = {},
  ) {}

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
    const modelRecord = await this.db.transaction(async (manager) => {
      const providerRepository = manager.getRepository(ProviderEntity);
      const providerModelRepository = manager.getRepository(ProviderModelEntity);

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

      const result = this.toProviderModelRecord(createdWithProvider);
      await this.auditService.writeAuditLog(manager, options, {
        action: 'provider_model.create',
        resource: 'provider_model',
        resourceId: created.modelId,
        before: null,
        after: result,
      });

      return result;
    });

    await this.notifyModelConfigChanged();
    return modelRecord;
  }

  async updateAdminModel(
    modelId: string,
    input: UpdateProviderModelInput,
    options: SwitchModelOptions = {},
  ): Promise<ProviderModelRecord> {
    const result = await this.db.transaction(async (manager) => {
      const providerRepository = manager.getRepository(ProviderEntity);
      const providerModelRepository = manager.getRepository(ProviderModelEntity);
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

      const after = this.toProviderModelRecord(savedWithProvider);
      await this.auditService.writeAuditLog(manager, options, {
        action: 'provider_model.update',
        resource: 'provider_model',
        resourceId: saved.modelId,
        before,
        after,
      });

      return after;
    });

    await this.notifyModelConfigChanged();
    return result;
  }

  async deleteAdminModel(modelId: string, options: SwitchModelOptions = {}): Promise<void> {
    await this.db.transaction(async (manager) => {
      const providerModelRepository = manager.getRepository(ProviderModelEntity);
      const routingPolicyRepository = manager.getRepository(RoutingPolicyEntity);

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

      await this.auditService.writeAuditLog(manager, options, {
        action: 'provider_model.delete',
        resource: 'provider_model',
        resourceId: modelId,
        before: this.toProviderModelRecord(model),
        after: null,
      });
    });

    await this.notifyModelConfigChanged();
  }

  private async notifyModelConfigChanged() {
    if (!this.options.onModelConfigChanged) {
      return;
    }
    await this.options.onModelConfigChanged();
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
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function toIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}

function isForeignKeyViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  const driverError = (error as QueryFailedError & { driverError?: { code?: string } }).driverError;
  return driverError?.code === '23503';
}
