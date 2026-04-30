import type { AppDataSource } from '../db/data-source.js';
import { ModelAdminAuditService } from './model-admin-audit-service.js';
import type {
  AuditLogRecord,
  CreateModelProfileInput,
  CreateProviderCredentialInput,
  CreateProviderInput,
  CreateProviderModelInput,
  ListAdminModelsQuery,
  ListAuditLogsQuery,
  ModelProfileRecord,
  ProviderCredentialRecord,
  ProviderModelRecord,
  ProviderRecord,
  RoutingPolicyRecord,
  RoutingPolicyWriter,
  SwitchModelOptions,
  UpdateModelProfileInput,
  UpdateProviderInput,
  UpdateProviderModelInput,
  UpsertRoutingPolicyInput,
  UpsertRoutingPolicyOptions,
} from './model-admin-contracts.js';
import { ModelCatalogService } from './model-catalog-service.js';
import { ProfilePolicyService } from './profile-policy-service.js';
import { ProviderAdminService } from './provider-admin-service.js';

interface ModelAdminServiceOptions {
  onModelConfigChanged?: () => Promise<void>;
}

export class ModelAdminService implements RoutingPolicyWriter {
  private readonly auditService: ModelAdminAuditService;
  private readonly providerService: ProviderAdminService;
  private readonly modelCatalogService: ModelCatalogService;
  private readonly profilePolicyService: ProfilePolicyService;

  constructor(
    db: AppDataSource,
    options: ModelAdminServiceOptions = {},
  ) {
    this.auditService = new ModelAdminAuditService(db);
    this.providerService = new ProviderAdminService(db, this.auditService, options);
    this.modelCatalogService = new ModelCatalogService(db, this.auditService, options);
    this.profilePolicyService = new ProfilePolicyService(db, this.auditService, options);
  }

  listProviders(): Promise<ProviderRecord[]> {
    return this.providerService.listProviders();
  }

  createProvider(
    input: CreateProviderInput,
    options: SwitchModelOptions = {},
  ): Promise<ProviderRecord> {
    return this.providerService.createProvider(input, options);
  }

  updateProvider(
    providerId: number,
    input: UpdateProviderInput,
    options: SwitchModelOptions = {},
  ): Promise<ProviderRecord> {
    return this.providerService.updateProvider(providerId, input, options);
  }

  deleteProvider(providerId: number, options: SwitchModelOptions = {}): Promise<void> {
    return this.providerService.deleteProvider(providerId, options);
  }

  createProviderCredential(
    providerId: number,
    input: CreateProviderCredentialInput,
    options: SwitchModelOptions = {},
  ): Promise<ProviderCredentialRecord> {
    return this.providerService.createProviderCredential(providerId, input, options);
  }

  listAdminModels(query: ListAdminModelsQuery = {}): Promise<ProviderModelRecord[]> {
    return this.modelCatalogService.listAdminModels(query);
  }

  createAdminModel(
    input: CreateProviderModelInput,
    options: SwitchModelOptions = {},
  ): Promise<ProviderModelRecord> {
    return this.modelCatalogService.createAdminModel(input, options);
  }

  updateAdminModel(
    modelId: string,
    input: UpdateProviderModelInput,
    options: SwitchModelOptions = {},
  ): Promise<ProviderModelRecord> {
    return this.modelCatalogService.updateAdminModel(modelId, input, options);
  }

  deleteAdminModel(modelId: string, options: SwitchModelOptions = {}): Promise<void> {
    return this.modelCatalogService.deleteAdminModel(modelId, options);
  }

  listModelProfiles(): Promise<ModelProfileRecord[]> {
    return this.profilePolicyService.listModelProfiles();
  }

  createModelProfile(
    input: CreateModelProfileInput,
    options: SwitchModelOptions = {},
  ): Promise<ModelProfileRecord> {
    return this.profilePolicyService.createModelProfile(input, options);
  }

  updateModelProfile(
    profileId: string,
    input: UpdateModelProfileInput,
    options: SwitchModelOptions = {},
  ): Promise<ModelProfileRecord> {
    return this.profilePolicyService.updateModelProfile(profileId, input, options);
  }

  upsertRoutingPolicy(
    profileId: string,
    input: UpsertRoutingPolicyInput,
    options: UpsertRoutingPolicyOptions = {},
  ): Promise<RoutingPolicyRecord> {
    return this.profilePolicyService.upsertRoutingPolicy(profileId, input, options);
  }

  listAuditLogs(query: ListAuditLogsQuery = {}): Promise<AuditLogRecord[]> {
    return this.auditService.listAuditLogs(query);
  }
}
