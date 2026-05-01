import { QueryFailedError } from 'typeorm';
import type { AppDataSource } from '../db/data-source.js';
import { ProviderCredentialEntity } from '../db/entities/provider-credential.entity.js';
import { ProviderEntity } from '../db/entities/provider.entity.js';
import { RoutingPolicyEntity } from '../db/entities/routing-policy.entity.js';
import { ConflictError, NotFoundError } from '../lib/errors.js';
import type {
  CreateProviderCredentialInput,
  CreateProviderInput,
  ProviderCredentialRecord,
  ProviderRecord,
  SwitchModelOptions,
  UpdateProviderInput,
} from './model-admin-contracts.js';
import { ModelAdminAuditService } from './model-admin-audit-service.js';

interface ProviderAdminServiceOptions {
  onModelConfigChanged?: () => Promise<void>;
}

export class ProviderAdminService {
  constructor(
    private readonly db: AppDataSource,
    private readonly auditService: ModelAdminAuditService,
    private readonly options: ProviderAdminServiceOptions = {},
  ) {}

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
    const provider = await this.db.transaction(async (manager) => {
      const providerRepository = manager.getRepository(ProviderEntity);
      const existing = await providerRepository.findOne({
        where: {
          name: input.name,
        },
      });
      if (existing) {
        throw new ConflictError(`Provider already exists: ${input.name}`);
      }

      const created = await providerRepository.save(
        providerRepository.create({
          name: input.name,
          type: input.type,
          status: input.status ?? 'active',
          metadata: input.metadata ?? null,
        }),
      );

      if (created.status === 'active') {
        await providerRepository
          .createQueryBuilder()
          .update(ProviderEntity)
          .set({ status: 'disabled' })
          .where('provider_id <> :providerId', { providerId: created.providerId })
          .andWhere('status = :status', { status: 'active' })
          .execute();
      }

      await this.auditService.writeAuditLog(manager, options, {
        action: 'provider.create',
        resource: 'provider',
        resourceId: String(created.providerId),
        before: null,
        after: {
          name: created.name,
          type: created.type,
          status: created.status,
        },
      });

      return created;
    });

    return this.toProviderRecord(provider);
  }

  async updateProvider(
    providerId: number,
    input: UpdateProviderInput,
    options: SwitchModelOptions = {},
  ): Promise<ProviderRecord> {
    const result = await this.db.transaction(async (manager) => {
      const providerRepository = manager.getRepository(ProviderEntity);
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

      await this.auditService.writeAuditLog(manager, options, {
        action: 'provider.update',
        resource: 'provider',
        resourceId: String(providerId),
        before,
        after,
      });

      return after;
    });

    await this.notifyModelConfigChanged();
    return result;
  }

  async deleteProvider(providerId: number, options: SwitchModelOptions = {}): Promise<void> {
    await this.db.transaction(async (manager) => {
      const providerRepository = manager.getRepository(ProviderEntity);
      const routingPolicyRepository = manager.getRepository(RoutingPolicyEntity);

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
          const fallbacks = normalizeNumberArray(policy.fallbacks);
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

      await this.auditService.writeAuditLog(manager, options, {
        action: 'provider.delete',
        resource: 'provider',
        resourceId: String(provider.providerId),
        before,
        after: null,
      });
    });

    await this.notifyModelConfigChanged();
  }

  async createProviderCredential(
    providerId: number,
    input: CreateProviderCredentialInput,
    options: SwitchModelOptions = {},
  ): Promise<ProviderCredentialRecord> {
    const credential = await this.db.transaction(async (manager) => {
      const providerRepository = manager.getRepository(ProviderEntity);
      const credentialRepository = manager.getRepository(ProviderCredentialEntity);
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

      const created = await credentialRepository.save(
        credentialRepository.create({
          providerId,
          secretRef: input.secretRef,
          keyVersion: input.keyVersion ?? 1,
          status: input.status ?? 'active',
        }),
      );

      await this.auditService.writeAuditLog(manager, options, {
        action: 'provider_credential.create',
        resource: 'provider_credential',
        resourceId: created.credentialId,
        before: null,
        after: {
          providerId: created.providerId,
          secretRef: created.secretRef,
          keyVersion: created.keyVersion,
          status: created.status,
        },
      });

      return created;
    });

    return this.toProviderCredentialRecord(credential);
  }

  private async notifyModelConfigChanged() {
    if (!this.options.onModelConfigChanged) {
      return;
    }
    await this.options.onModelConfigChanged();
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
}

function normalizeNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is number => Number.isInteger(item));
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
