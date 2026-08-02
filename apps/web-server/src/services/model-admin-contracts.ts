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
  UpdateModelProfileInput,
  UpdateProviderInput,
  UpdateProviderModelInput,
  UpsertRoutingPolicyInput,
} from '@agent-flow/web-contracts';

export type {
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
  UpdateModelProfileInput,
  UpdateProviderInput,
  UpdateProviderModelInput,
  UpsertRoutingPolicyInput,
};

export const DEFAULT_PROFILE_ID = 'chat-default';
export const DEFAULT_POLICY_ID = 'chat-default-policy';

export interface SwitchModelOptions {
  actorId?: string;
  requestId?: string;
}

export interface UpsertRoutingPolicyOptions extends SwitchModelOptions {
  auditAction?: string;
}

export interface RoutingPolicyWriter {
  upsertRoutingPolicy(
    profileId: string,
    input: UpsertRoutingPolicyInput,
    options?: UpsertRoutingPolicyOptions,
  ): Promise<RoutingPolicyRecord>;
}
