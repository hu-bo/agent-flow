export interface HealthResponse {
  status: string;
  model: string;
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
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
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

async function request<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

export function fetchHealth(): Promise<HealthResponse> {
  return request('/api/health');
}

export function fetchSessions(): Promise<Session[]> {
  return request('/api/sessions');
}

export function createSession(opts?: Record<string, unknown>): Promise<Session> {
  return request('/api/sessions', { method: 'POST', body: JSON.stringify(opts ?? {}) });
}

export function deleteSession(id: string): Promise<void> {
  return request(`/api/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function fetchTask(id: string): Promise<TaskState> {
  return request(`/api/tasks/${encodeURIComponent(id)}`);
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
