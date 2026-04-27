export interface HealthResponse {
  status: string;
  model: string;
}

export interface RuntimeModelDescriptor {
  modelId: string;
  displayName: string;
  provider: string;
  maxInputTokens: number;
}

export interface Session {
  sessionId: string;
  modelId: string;
  messageCount: number;
  createdAt: string;
}

export interface TaskState {
  taskId: string;
  sessionId: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  latestCheckpointId: string;
  error?: string;
  retryCount: number;
  maxRetries: number;
  outputs?: unknown;
}

export interface CreateTaskResult {
  taskId: string;
  status: string;
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

async function request<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${text}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export function fetchHealth(): Promise<HealthResponse> {
  return request('/api/health');
}

export function fetchModels(): Promise<{ currentModel: string; models: RuntimeModelDescriptor[] }> {
  return request('/api/models');
}

export async function fetchSessions(): Promise<Session[]> {
  const payload = await request<{ sessions: Session[] }>('/api/sessions');
  return payload.sessions;
}

export async function createSession(opts?: Record<string, unknown>): Promise<Session> {
  const payload = await request<{ session: Session }>('/api/sessions', {
    method: 'POST',
    body: JSON.stringify(opts ?? {}),
  });
  return payload.session;
}

export function deleteSession(id: string): Promise<void> {
  return request(`/api/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function fetchTask(id: string): Promise<TaskState> {
  const payload = await request<{ task: TaskState }>(`/api/tasks/${encodeURIComponent(id)}`);
  return payload.task;
}

export function createTask(opts: { prompt: string; model?: string; config?: Record<string, unknown> }): Promise<CreateTaskResult> {
  return request('/api/tasks', { method: 'POST', body: JSON.stringify(opts) });
}

export function switchModel(modelId: string): Promise<unknown> {
  return request('/api/model', { method: 'POST', body: JSON.stringify({ modelId }) });
}

export function triggerCompact(): Promise<unknown> {
  return request('/api/compact', { method: 'POST', body: JSON.stringify({}) });
}

export async function fetchAdminProviders(): Promise<ProviderRecord[]> {
  const payload = await request<{ providers: ProviderRecord[] }>('/api/admin/providers');
  return payload.providers;
}

export async function createAdminProvider(input: {
  name: string;
  type: string;
  status?: 'active' | 'disabled';
  metadata?: Record<string, unknown> | null;
}): Promise<ProviderRecord> {
  const payload = await request<{ provider: ProviderRecord }>('/api/admin/providers', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return payload.provider;
}

export async function deleteAdminProvider(providerId: number): Promise<void> {
  await request(`/api/admin/providers/${providerId}`, {
    method: 'DELETE',
  });
}

export async function updateAdminProvider(
  providerId: number,
  input: { status: 'active' | 'disabled' },
): Promise<ProviderRecord> {
  const payload = await request<{ provider: ProviderRecord }>(
    `/api/admin/providers/${providerId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  );
  return payload.provider;
}

export async function createProviderCredential(
  providerId: number,
  input: { apiKey: string; keyVersion?: number; status?: 'active' | 'disabled' },
): Promise<void> {
  await request(`/api/admin/providers/${providerId}/credentials`, {
    method: 'POST',
    body: JSON.stringify({
      secretRef: input.apiKey,
      keyVersion: input.keyVersion,
      status: input.status,
    }),
  });
}

export async function fetchAdminModels(provider?: string): Promise<ProviderModelRecord[]> {
  const query = provider ? `?provider=${encodeURIComponent(provider)}` : '';
  const payload = await request<{ models: ProviderModelRecord[] }>(`/api/admin/models${query}`);
  return payload.models;
}

export async function updateAdminModel(
  modelId: string,
  input: {
    displayName?: string;
    providerId?: number;
    tokenLimit?: number;
    status?: 'active' | 'disabled';
  },
): Promise<ProviderModelRecord> {
  const payload = await request<{ model: ProviderModelRecord }>(
    `/api/admin/models/${encodeURIComponent(modelId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  );
  return payload.model;
}

export async function createAdminModel(input: {
  modelId: string;
  displayName: string;
  providerId: number;
  tokenLimit: number;
  status?: 'active' | 'disabled';
}): Promise<ProviderModelRecord> {
  const payload = await request<{ model: ProviderModelRecord }>('/api/admin/models', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return payload.model;
}

export async function deleteAdminModel(modelId: string): Promise<void> {
  await request(`/api/admin/models/${encodeURIComponent(modelId)}`, {
    method: 'DELETE',
  });
}

export async function fetchModelProfiles(): Promise<ModelProfileRecord[]> {
  const payload = await request<{ profiles: ModelProfileRecord[] }>('/api/admin/model-profiles');
  return payload.profiles;
}

export async function createModelProfile(input: {
  profileId: string;
  displayName: string;
  intentTags?: string[];
  status?: 'active' | 'disabled';
}): Promise<ModelProfileRecord> {
  const payload = await request<{ profile: ModelProfileRecord }>('/api/admin/model-profiles', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return payload.profile;
}

export async function upsertRoutingPolicy(
  profileId: string,
  input: {
    primaryModelId: string;
    fallbacks?: string[];
    strategy?: string;
    status?: 'active' | 'disabled';
  },
): Promise<RoutingPolicyRecord> {
  const payload = await request<{ policy: RoutingPolicyRecord }>(
    `/api/admin/model-profiles/${encodeURIComponent(profileId)}/routing`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
  );
  return payload.policy;
}

export async function fetchAuditLogs(limit = 30): Promise<AuditLogRecord[]> {
  const payload = await request<{ auditLogs: AuditLogRecord[] }>(
    `/api/admin/audit-logs?limit=${limit}`,
  );
  return payload.auditLogs;
}
