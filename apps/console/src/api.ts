import axios, { type AxiosRequestConfig } from 'axios';

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

interface ApiSuccessEnvelope<T> {
  code: number;
  data: T;
  message: string;
  requestId: string;
}

interface ApiErrorEnvelope {
  code?: string | number;
  data?: null;
  message?: string;
  error?: string;
  requestId?: string;
  details?: unknown;
}

function isApiSuccessEnvelope<T>(value: unknown): value is ApiSuccessEnvelope<T> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const payload = value as Partial<ApiSuccessEnvelope<T>>;
  return (
    typeof payload.code === 'number' &&
    'data' in payload &&
    typeof payload.message === 'string' &&
    typeof payload.requestId === 'string'
  );
}

const AUTH_APP_NAME = import.meta.env.VITE_CASDOOR_APP_NAME || 'aflow';
const ACCESS_TOKEN_KEY = `af_console_${AUTH_APP_NAME}_access_token`;

function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function readErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as ApiErrorEnvelope | undefined;
    if (payload?.message) return payload.message;
    if (payload?.error) return payload.error;
    const rawData: unknown = error.response?.data;
    if (typeof rawData === 'string' && rawData.trim().length > 0) {
      return rawData;
    }
    return error.message || 'Request failed';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Request failed';
}

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const res = await apiClient.request<unknown>(config);

    if (res.status === 204) {
      return undefined as T;
    }

    const payload = res.data as unknown;
    if (isApiSuccessEnvelope<T>(payload)) {
      return payload.data;
    }

    return payload as T;
  } catch (error) {
    throw new Error(readErrorMessage(error));
  }
}

export function fetchHealth(): Promise<HealthResponse> {
  return request({ url: '/api/health', method: 'GET' });
}

export function fetchModels(): Promise<{ currentModel: string; models: RuntimeModelDescriptor[] }> {
  return request({ url: '/api/models', method: 'GET' });
}

export async function fetchSessions(): Promise<Session[]> {
  const payload = await request<{ sessions: Session[] }>({ url: '/api/sessions', method: 'GET' });
  return payload.sessions;
}

export async function createSession(opts?: Record<string, unknown>): Promise<Session> {
  const payload = await request<{ session: Session }>({
    url: '/api/sessions',
    method: 'POST',
    data: opts ?? {},
  });
  return payload.session;
}

export function deleteSession(id: string): Promise<void> {
  return request({ url: `/api/sessions/${encodeURIComponent(id)}`, method: 'DELETE' });
}

export async function fetchTask(id: string): Promise<TaskState> {
  const payload = await request<{ task: TaskState }>({
    url: `/api/tasks/${encodeURIComponent(id)}`,
    method: 'GET',
  });
  return payload.task;
}

export function createTask(opts: {
  prompt: string;
  model?: string;
  config?: Record<string, unknown>;
}): Promise<CreateTaskResult> {
  return request({ url: '/api/tasks', method: 'POST', data: opts });
}

export function switchModel(modelId: string): Promise<unknown> {
  return request({ url: '/api/model', method: 'POST', data: { modelId } });
}

export function triggerCompact(): Promise<unknown> {
  return request({ url: '/api/compact', method: 'POST', data: {} });
}

export async function fetchAdminProviders(): Promise<ProviderRecord[]> {
  const payload = await request<{ providers: ProviderRecord[] }>({
    url: '/api/admin/providers',
    method: 'GET',
  });
  return payload.providers;
}

export async function createAdminProvider(input: {
  name: string;
  type: string;
  status?: 'active' | 'disabled';
  metadata?: Record<string, unknown> | null;
}): Promise<ProviderRecord> {
  const payload = await request<{ provider: ProviderRecord }>({
    url: '/api/admin/providers',
    method: 'POST',
    data: input,
  });
  return payload.provider;
}

export async function deleteAdminProvider(providerId: number): Promise<void> {
  await request({
    url: `/api/admin/providers/${providerId}`,
    method: 'DELETE',
  });
}

export async function updateAdminProvider(
  providerId: number,
  input: { status: 'active' | 'disabled' },
): Promise<ProviderRecord> {
  const payload = await request<{ provider: ProviderRecord }>({
    url: `/api/admin/providers/${providerId}`,
    method: 'PATCH',
    data: input,
  });
  return payload.provider;
}

export async function createProviderCredential(
  providerId: number,
  input: { apiKey: string; keyVersion?: number; status?: 'active' | 'disabled' },
): Promise<void> {
  await request({
    url: `/api/admin/providers/${providerId}/credentials`,
    method: 'POST',
    data: {
      secretRef: input.apiKey,
      keyVersion: input.keyVersion,
      status: input.status,
    },
  });
}

export async function fetchAdminModels(provider?: string): Promise<ProviderModelRecord[]> {
  const query = provider ? `?provider=${encodeURIComponent(provider)}` : '';
  const payload = await request<{ models: ProviderModelRecord[] }>({
    url: `/api/admin/models${query}`,
    method: 'GET',
  });
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
  const payload = await request<{ model: ProviderModelRecord }>({
    url: `/api/admin/models/${encodeURIComponent(modelId)}`,
    method: 'PATCH',
    data: input,
  });
  return payload.model;
}

export async function createAdminModel(input: {
  modelId: string;
  displayName: string;
  providerId: number;
  tokenLimit: number;
  status?: 'active' | 'disabled';
}): Promise<ProviderModelRecord> {
  const payload = await request<{ model: ProviderModelRecord }>({
    url: '/api/admin/models',
    method: 'POST',
    data: input,
  });
  return payload.model;
}

export async function deleteAdminModel(modelId: string): Promise<void> {
  await request({
    url: `/api/admin/models/${encodeURIComponent(modelId)}`,
    method: 'DELETE',
  });
}

export async function fetchModelProfiles(): Promise<ModelProfileRecord[]> {
  const payload = await request<{ profiles: ModelProfileRecord[] }>({
    url: '/api/admin/model-profiles',
    method: 'GET',
  });
  return payload.profiles;
}

export async function createModelProfile(input: {
  profileId: string;
  displayName: string;
  intentTags?: string[];
  status?: 'active' | 'disabled';
}): Promise<ModelProfileRecord> {
  const payload = await request<{ profile: ModelProfileRecord }>({
    url: '/api/admin/model-profiles',
    method: 'POST',
    data: input,
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
  const payload = await request<{ policy: RoutingPolicyRecord }>({
    url: `/api/admin/model-profiles/${encodeURIComponent(profileId)}/routing`,
    method: 'PUT',
    data: input,
  });
  return payload.policy;
}

export async function fetchAuditLogs(limit = 30): Promise<AuditLogRecord[]> {
  const payload = await request<{ auditLogs: AuditLogRecord[] }>({
    url: `/api/admin/audit-logs?limit=${limit}`,
    method: 'GET',
  });
  return payload.auditLogs;
}
