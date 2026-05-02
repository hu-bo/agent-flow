import axios, { type AxiosRequestConfig } from 'axios';
import type { FilePart, UnifiedMessage } from '@agent-flow/core/messages';

interface ApiErrorPayload {
  code?: string | number;
  message?: string;
  error?: string;
  details?: unknown;
}

interface ApiSuccessEnvelope<T> {
  code: number;
  data: T;
  message: string;
  requestId: string;
}

export interface SessionRecord {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  modelId: number;
  cwd: string;
  messageCount: number;
  systemPrompt?: string;
}

export interface ModelDescriptor {
  modelId: number;
  model: string;
  displayName: string;
  provider: string;
  providerType: string;
  providerModel: string;
  maxInputTokens: number;
}

export interface RunnerRecord {
  runnerId: string;
  ownerUserId: string;
  tokenId: string | null;
  kind: 'local' | 'remote' | 'sandbox';
  status: 'online' | 'offline';
  host: string | null;
  hostName: string | null;
  hostIp: string | null;
  version: string | null;
  capabilities: string[];
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RunnerTokenIssueResult {
  runnerToken: string;
  tokenId: string;
  serverAddr: string;
  grpcServerAddr: string;
  downloadUrls: {
    windows: string;
    macos: string;
    linux: string;
  };
}

export interface RunnerApprovalTicketResult {
  approvalTicket: string;
  ticketId: string;
  expiresAt: string;
  scope: {
    sessionId: string;
    command: string;
    workingDir: string;
  };
}

const AUTH_APP_NAME = import.meta.env.VITE_CASDOOR_APP_NAME || 'aflow';
const ACCESS_TOKEN_KEY = `af_webui_${AUTH_APP_NAME}_access_token`;

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

function extractAxiosErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const payload = error.response?.data;
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

async function readFetchErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    if (payload.message) return payload.message;
    if (payload.error) return payload.error;
  } catch {
    // ignore and fallback to text
  }

  const text = await response.text().catch(() => '');
  return text || `Request failed: ${response.status}`;
}

async function requestJson<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.request<ApiSuccessEnvelope<T>>(config);
    return response.data.data;
  } catch (error) {
    throw new Error(extractAxiosErrorMessage(error));
  }
}

async function requestNoContent(config: AxiosRequestConfig): Promise<void> {
  try {
    await apiClient.request(config);
  } catch (error) {
    throw new Error(extractAxiosErrorMessage(error));
  }
}

export async function fetchHealth(): Promise<{ status: string; model: string }> {
  return requestJson({ url: '/api/health', method: 'GET' });
}

export async function fetchSessions(): Promise<{ sessions: SessionRecord[] }> {
  return requestJson({ url: '/api/sessions', method: 'GET' });
}

export async function fetchModels(): Promise<{ currentModel: number; models: ModelDescriptor[] }> {
  return requestJson({ url: '/api/models', method: 'GET' });
}

export async function fetchSession(
  sessionId: string,
): Promise<{ session: SessionRecord; messages: UnifiedMessage[] }> {
  return requestJson({ url: `/api/sessions/${sessionId}`, method: 'GET' });
}

export async function createSession(opts?: {
  model?: string | number;
  systemPrompt?: string;
}): Promise<{ session: SessionRecord }> {
  return requestJson({
    url: '/api/sessions',
    method: 'POST',
    data: {
      modelId: opts?.model,
      systemPrompt: opts?.systemPrompt,
    },
  });
}

export async function deleteSession(id: string): Promise<void> {
  await requestNoContent({ url: `/api/sessions/${id}`, method: 'DELETE' });
}

export async function switchModel(modelId: string | number): Promise<{ model: number }> {
  return requestJson({
    url: '/api/model',
    method: 'POST',
    data: { modelId },
  });
}

export async function triggerCompact(
  sessionId: string,
): Promise<{ sessionId: string; stats: unknown }> {
  return requestJson({
    url: '/api/compact',
    method: 'POST',
    data: { sessionId, trigger: 'manual' },
  });
}

export async function fetchRunners(): Promise<{ runners: RunnerRecord[] }> {
  return requestJson({ url: '/api/runners', method: 'GET' });
}

export async function deleteRunner(runnerId: string): Promise<void> {
  await requestNoContent({ url: `/api/runners/${runnerId}`, method: 'DELETE' });
}

interface StreamRunnersOptions {
  signal?: AbortSignal;
  onRunners: (runners: RunnerRecord[]) => void;
}

export async function streamRunners({
  signal,
  onRunners,
}: StreamRunnersOptions): Promise<void> {
  const token = getAccessToken();
  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch('/api/runners/events', {
    method: 'GET',
    headers,
    signal,
  });

  if (!response.ok) {
    throw new Error(await readFetchErrorMessage(response));
  }

  if (!response.body) {
    throw new Error('SSE stream body is empty');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const handleData = (payload: string) => {
    if (payload === '[DONE]') {
      return;
    }
    const parsed = JSON.parse(payload) as { runners?: RunnerRecord[]; error?: string };
    if (parsed.error) {
      throw new Error(parsed.error);
    }
    if (Array.isArray(parsed.runners)) {
      onRunners(parsed.runners);
    }
  };

  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    buffer += decoder.decode(chunk.value, { stream: true });
    buffer = consumeSseBuffer(buffer, handleData);
  }

  buffer += decoder.decode();
  consumeSseBuffer(buffer, handleData);
}

export async function fetchRunnerDownloads(): Promise<{
  downloadUrls: {
    windows: string;
    macos: string;
    linux: string;
  };
}> {
  return requestJson({ url: '/api/runners/downloads', method: 'GET' });
}

export async function issueRunnerToken(): Promise<RunnerTokenIssueResult> {
  return requestJson({
    url: '/api/runners/token',
    method: 'POST',
    data: {},
  });
}

export async function rotateRunnerToken(): Promise<RunnerTokenIssueResult> {
  return requestJson({
    url: '/api/runners/token/rotate',
    method: 'POST',
    data: {},
  });
}

export async function issueRunnerApprovalTicket(input: {
  sessionId: string;
  command: string;
  workingDir?: string;
  ttlSec?: number;
}): Promise<RunnerApprovalTicketResult> {
  return requestJson({
    url: '/api/runners/approval-ticket',
    method: 'POST',
    data: input,
  });
}

export async function bindSessionRunner(sessionId: string, runnerId: string): Promise<{
  sessionId: string;
  runnerId: string;
}> {
  return requestJson({
    url: `/api/sessions/${sessionId}/runner-binding`,
    method: 'POST',
    data: { runnerId },
  });
}

interface StreamChatOptions {
  message: string;
  model?: string | number;
  reasoningEffort?: 'low' | 'medium' | 'high';
  sessionId: string;
  approveRiskyOps?: boolean;
  approvalTicket?: string;
  attachments?: FilePart[];
  signal?: AbortSignal;
  onMessage: (message: UnifiedMessage) => void;
}

function consumeSseBuffer(buffer: string, onData: (data: string) => void): string {
  let current = buffer;
  let boundaryIndex = current.indexOf('\n\n');

  while (boundaryIndex !== -1) {
    const rawEvent = current.slice(0, boundaryIndex);
    current = current.slice(boundaryIndex + 2);

    const data = rawEvent
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart())
      .join('\n');

    if (data) {
      onData(data);
    }

    boundaryIndex = current.indexOf('\n\n');
  }

  return current;
}

export async function streamChat({
  message,
  model,
  reasoningEffort,
  sessionId,
  approveRiskyOps,
  approvalTicket,
  attachments,
  signal,
  onMessage,
}: StreamChatOptions): Promise<void> {
  const token = getAccessToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message,
      model,
      reasoningEffort,
      sessionId,
      approveRiskyOps: Boolean(approveRiskyOps),
      approvalTicket,
      attachments,
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(await readFetchErrorMessage(response));
  }

  if (!response.body) {
    throw new Error('SSE stream body is empty');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let done = false;

  const handleData = (payload: string) => {
    if (payload === '[DONE]') {
      done = true;
      return;
    }

    const parsed = JSON.parse(payload) as UnifiedMessage | { error: string };
    if ('error' in parsed) {
      throw new Error(parsed.error);
    }
    onMessage(parsed);
  };

  while (!done) {
    const chunk = await reader.read();
    if (chunk.done) break;
    buffer += decoder.decode(chunk.value, { stream: true });
    buffer = consumeSseBuffer(buffer, handleData);
  }

  buffer += decoder.decode();
  consumeSseBuffer(buffer, handleData);
}

export async function retrySessionMessage(input: {
  sessionId: string;
  messageId: string;
  model?: string | number;
  reasoningEffort?: 'low' | 'medium' | 'high';
}): Promise<{ session: SessionRecord; messages: UnifiedMessage[] }> {
  return requestJson({
    url: `/api/chat/${input.sessionId}/retry`,
    method: 'POST',
    data: {
      messageId: input.messageId,
      model: input.model,
      reasoningEffort: input.reasoningEffort,
    },
  });
}

export async function deleteSessionMessage(
  sessionId: string,
  messageId: string,
): Promise<{ session: SessionRecord; messages: UnifiedMessage[] }> {
  return requestJson({
    url: `/api/chat/${sessionId}/messages/${messageId}`,
    method: 'DELETE',
  });
}
