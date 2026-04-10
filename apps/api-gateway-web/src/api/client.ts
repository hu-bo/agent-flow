const API_KEY_STORAGE = 'af_gw_api_key';

function getApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE);
}

export function setApiKey(key: string) {
  localStorage.setItem(API_KEY_STORAGE, key);
}

export function clearApiKey() {
  localStorage.removeItem(API_KEY_STORAGE);
}

export function hasApiKey(): boolean {
  return !!getApiKey();
}

async function request<T>(url: string, opts?: RequestInit): Promise<T> {
  const apiKey = getApiKey();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  const res = await fetch(url, { headers, ...opts });
  if (res.status === 401) {
    clearApiKey();
    window.location.hash = '';
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Health
export interface HealthResponse {
  status: string;
}

export function fetchHealth(): Promise<HealthResponse> {
  return request('/health');
}

// Admin
export interface AdminInitRequest {
  email: string;
  name: string;
}

export interface AdminInitResponse {
  user_id: string;
  email: string;
  api_key: string;
  message: string;
}

export function adminInit(data: AdminInitRequest): Promise<AdminInitResponse> {
  return request('/v1/admin/init', { method: 'POST', body: JSON.stringify(data) });
}

export interface CreateUserRequest {
  email: string;
  name: string;
  rate_limit_rpm: number;
  is_admin: boolean;
}

export function createUser(data: CreateUserRequest): Promise<AdminInitResponse> {
  return request('/v1/admin/users', { method: 'POST', body: JSON.stringify(data) });
}

// Providers
export interface Provider {
  id: string;
  provider_id: string;
  display_name: string;
  base_url: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateProviderRequest {
  provider_id: string;
  display_name: string;
  api_key: string;
  base_url: string;
}

export interface UpdateProviderRequest {
  display_name: string;
  api_key: string;
  base_url: string;
}

export function fetchProviders(): Promise<Provider[]> {
  return request('/v1/providers');
}

export function createProvider(data: CreateProviderRequest): Promise<Provider> {
  return request('/v1/providers', { method: 'POST', body: JSON.stringify(data) });
}

export function updateProvider(id: string, data: UpdateProviderRequest): Promise<{ status: string }> {
  return request(`/v1/providers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteProvider(id: string): Promise<void> {
  return request(`/v1/providers/${id}`, { method: 'DELETE' });
}

// API Keys
export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  last_used_at: string;
  created_at: string;
}

export interface CreateApiKeyResponse {
  id: string;
  name: string;
  key: string;
  key_prefix: string;
  message: string;
}

export function fetchApiKeys(): Promise<ApiKey[]> {
  return request('/v1/api-keys');
}

export function createApiKey(name: string): Promise<CreateApiKeyResponse> {
  return request('/v1/api-keys', { method: 'POST', body: JSON.stringify({ name }) });
}

export function deleteApiKey(id: string): Promise<void> {
  return request(`/v1/api-keys/${id}`, { method: 'DELETE' });
}

// Logs
export interface LogEntry {
  id: string;
  conversation_id: string;
  provider_id: string;
  model: string;
  status_code: number;
  duration_ms: number;
  created_at: string;
}

export interface LogDetail extends LogEntry {
  request_body: unknown;
  response_body: unknown;
}

export interface LogListResponse {
  data: LogEntry[];
  page: number;
  size: number;
}

export function fetchLogs(params: { page?: number; size?: number; conversation_id?: string } = {}): Promise<LogListResponse> {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.size) qs.set('size', String(params.size));
  if (params.conversation_id) qs.set('conversation_id', params.conversation_id);
  return request(`/v1/logs?${qs}`);
}

export function fetchLogDetail(id: string): Promise<LogDetail> {
  return request(`/v1/logs/${id}`);
}
