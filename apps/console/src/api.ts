import axios, { type AxiosRequestConfig } from 'axios';
import type {
  ModelProfileRecord,
  ProviderModelRecord,
  ProviderRecord,
  RoutingPolicyRecord,
  SessionRecord,
  TaskRecord,
} from '@agent-flow/web-contracts';

export type {
  ModelProfileRecord,
  ProviderModelRecord,
  ProviderRecord,
  RoutingPolicyRecord,
};

export interface HealthResponse {
  status: string;
  model: string;
}

export type Session = SessionRecord;
export type TaskState = TaskRecord;

export interface CreateTaskResult {
  taskId: string;
  status: string;
}

interface ApiErrorEnvelope {
  code?: string | number;
  message?: string;
  error?: string;
  details?: unknown;
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

    return res.data as T;
  } catch (error) {
    throw new Error(readErrorMessage(error));
  }
}

export function fetchHealth(): Promise<HealthResponse> {
  return request({ url: '/api/health', method: 'GET' });
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
  modelId?: number;
  config?: Record<string, unknown>;
}): Promise<CreateTaskResult> {
  return request({ url: '/api/tasks', method: 'POST', data: opts });
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
  modelId: number,
  input: {
    model?: string;
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
  model: string;
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

export async function deleteAdminModel(modelId: number): Promise<void> {
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

export async function upsertRoutingPolicy(
  profileId: string,
  input: {
    primaryModelId: number;
    fallbacks?: number[];
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
