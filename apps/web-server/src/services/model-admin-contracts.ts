export const DEFAULT_PROFILE_ID = 'chat-default';
export const DEFAULT_POLICY_ID = 'chat-default-policy';

export interface SwitchModelOptions {
  actorId?: string;
  requestId?: string;
}

export interface UpsertRoutingPolicyOptions extends SwitchModelOptions {
  auditAction?: string;
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
  model?: string;
  providerId?: number;
  tokenLimit?: number;
  status?: 'active' | 'disabled';
}

export interface CreateProviderModelInput {
  model: string;
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
  primaryModelId: number;
  fallbacks?: number[];
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
  modelId: number;
  model: string;
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
  primaryModelId: number;
  fallbacks: number[];
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

export interface RoutingPolicyWriter {
  upsertRoutingPolicy(
    profileId: string,
    input: UpsertRoutingPolicyInput,
    options?: UpsertRoutingPolicyOptions,
  ): Promise<RoutingPolicyRecord>;
}
