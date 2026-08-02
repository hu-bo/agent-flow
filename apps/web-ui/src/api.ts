import axios, { type AxiosRequestConfig } from 'axios';
import type { FilePart, UnifiedMessage } from '@agent-flow/core/messages';
import {
  chatStreamEventSchema,
  type ChatStreamEvent,
  type ModelDescriptor,
  type ProjectRecord,
  type RunnerApprovalGrant,
  type RunnerDirectoryEntry,
  type RunnerDownloadPlatform,
  type RunnerRecord,
  type RunnerTokenIssueResult,
  type SessionRecord,
  type SpecDocType,
  type SpecWorkflowState,
} from '@agent-flow/web-contracts';

export type {
  ModelDescriptor,
  ProjectRecord,
  RunnerApprovalGrant,
  RunnerDirectoryEntry,
  RunnerDownloadPlatform,
  RunnerRecord,
  RunnerTokenIssueResult,
  SessionRecord,
  SpecDocType,
  SpecWorkflowState,
};

interface ApiErrorPayload {
  code?: string | number;
  message?: string;
  error?: string;
  details?: unknown;
}

export interface ApiBusinessErrorDetails {
  projectId?: string;
  projectName?: string;
  rootPath?: string;
  action?: string;
}

class ApiBusinessError extends Error {
  readonly code: string | number;
  readonly details?: unknown;

  constructor(message: string, code: string | number, details?: unknown) {
    super(message);
    this.name = 'ApiBusinessError';
    this.code = code;
    this.details = details;
  }
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

function extractAxiosError(error: unknown): Error {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const payload = error.response?.data;
    if (payload?.message) {
      return new ApiBusinessError(payload.message, payload.code ?? error.code ?? 'REQUEST_FAILED', payload.details);
    }
    if (payload?.error) {
      return new ApiBusinessError(payload.error, payload.code ?? error.code ?? 'REQUEST_FAILED', payload.details);
    }
    return new Error(extractAxiosErrorMessage(error));
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('Request failed');
}

function asBusinessErrorDetails(value: unknown): ApiBusinessErrorDetails | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  return value as ApiBusinessErrorDetails;
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
    const response = await apiClient.request<T>(config);
    return response.data;
  } catch (error) {
    throw extractAxiosError(error);
  }
}

async function requestNoContent(config: AxiosRequestConfig): Promise<void> {
  try {
    await apiClient.request(config);
  } catch (error) {
    throw extractAxiosError(error);
  }
}

export async function fetchSessions(): Promise<{ sessions: SessionRecord[] }> {
  return requestJson({ url: '/api/sessions', method: 'GET' });
}

export async function fetchProjects(): Promise<{ projects: ProjectRecord[] }> {
  return requestJson({ url: '/api/projects', method: 'GET' });
}

export async function createProject(input: {
  name?: string;
  rootPath: string;
  runnerId: string;
}): Promise<{ project: ProjectRecord }> {
  return requestJson({
    url: '/api/projects',
    method: 'POST',
    data: input,
  });
}

export async function deleteProject(projectId: string): Promise<void> {
  await requestNoContent({ url: `/api/projects/${projectId}`, method: 'DELETE' });
}

export async function fetchProjectSessions(projectId: string): Promise<{ sessions: SessionRecord[] }> {
  return requestJson({ url: `/api/projects/${projectId}/sessions`, method: 'GET' });
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
  mode?: 'vibe' | 'spec';
  title?: string;
  systemPrompt?: string;
  projectId?: string;
}): Promise<{ session: SessionRecord }> {
  return requestJson({
    url: '/api/sessions',
    method: 'POST',
    data: {
      modelId: opts?.model,
      mode: opts?.mode,
      title: opts?.title,
      systemPrompt: opts?.systemPrompt,
      projectId: opts?.projectId,
    },
  });
}

export async function deleteSession(id: string): Promise<void> {
  await requestNoContent({ url: `/api/sessions/${id}`, method: 'DELETE' });
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

export function formatDeleteRunnerError(error: unknown): string | null {
  if (!(error instanceof ApiBusinessError)) {
    return null;
  }
  if (!(error.code === 409 || error.code === '409')) {
    return null;
  }
  const details = asBusinessErrorDetails(error.details);
  if (!details?.projectName && !details?.projectId) {
    return null;
  }
  const projectLabel = details.projectName ? `"${details.projectName}"` : details.projectId;
  const action = details.action?.trim();
  return action
    ? `Runner is used by project ${projectLabel}. ${action}`
    : `Runner is used by project ${projectLabel}.`;
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

  const handleFrame = (frame: { data: string }) => {
    if (frame.data === '[DONE]') return;
    if (!frame.data) return;

    const parsed = JSON.parse(frame.data) as { runners?: RunnerRecord[]; error?: string };
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
    buffer = consumeSseBuffer(buffer, handleFrame);
  }

  buffer += decoder.decode();
  consumeSseBuffer(buffer, handleFrame);
}

export async function downloadRunnerPackage(platform: RunnerDownloadPlatform): Promise<void> {
  const response = await apiClient.request<Blob>({
    url: `/api/runners/downloads/${platform}`,
    method: 'GET',
    responseType: 'blob',
  });
  const disposition = response.headers['content-disposition'];
  const fallbackName = `agent-flow-runner-${platform}.zip`;
  const fileName = parseContentDispositionFilename(disposition) ?? fallbackName;
  const blob = response.data;
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function issueRunnerToken(): Promise<RunnerTokenIssueResult> {
  return requestJson({
    url: '/api/runners/token',
    method: 'POST',
    data: {},
  });
}

function parseContentDispositionFilename(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const utf8Match = value.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }
  const asciiMatch = value.match(/filename="([^"]+)"/i) ?? value.match(/filename=([^;]+)/i);
  return asciiMatch?.[1]?.trim();
}

export async function decideRunnerApproval(
  requestId: string,
  decision: 'once' | 'always' | 'deny',
): Promise<{ requestId: string; decision: 'once' | 'always' | 'deny'; approved: boolean; persistentGrantId?: string }> {
  return requestJson({
    url: `/api/runner-approvals/${encodeURIComponent(requestId)}/decision`,
    method: 'POST',
    data: { decision },
  });
}

export async function fetchRunnerApprovalGrants(): Promise<{ grants: RunnerApprovalGrant[] }> {
  return requestJson({ url: '/api/runners/approval-grants', method: 'GET' });
}

export async function revokeRunnerApprovalGrant(grantId: string): Promise<void> {
  await requestNoContent({ url: `/api/runners/approval-grants/${grantId}`, method: 'DELETE' });
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

export async function fetchRunnerRoots(runnerId: string): Promise<{ roots: RunnerDirectoryEntry[] }> {
  return requestJson({
    url: `/api/runners/${runnerId}/fs/roots`,
    method: 'POST',
    data: {},
  });
}

export async function fetchRunnerDirectory(input: {
  runnerId: string;
  path: string;
  includeHidden?: boolean;
}): Promise<{ path: string; entries: RunnerDirectoryEntry[]; total: number }> {
  return requestJson({
    url: `/api/runners/${input.runnerId}/fs/list`,
    method: 'POST',
    data: {
      path: input.path,
      includeHidden: input.includeHidden,
    },
  });
}

interface StreamChatOptions {
  turnId?: string;
  message: string;
  modelId?: string | number;
  reasoningEffort?: 'low' | 'medium' | 'high';
  sessionId: string;
  attachments?: FilePart[];
  signal?: AbortSignal;
  onEvent: (event: ChatStreamEvent) => void;
}

type SseFrame = {
  event: string | null;
  id: string | null;
  data: string;
};

function consumeSseBuffer(buffer: string, onFrame: (frame: SseFrame) => void): string {
  let current = buffer.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  let boundaryIndex = current.indexOf('\n\n');

  while (boundaryIndex !== -1) {
    const rawEvent = current.slice(0, boundaryIndex);
    current = current.slice(boundaryIndex + 2);

    let event: string | null = null;
    let id: string | null = null;
    const dataLines: string[] = [];

    rawEvent.split('\n').forEach((line) => {
      if (!line || line.startsWith(':')) return;
      if (line.startsWith('event:')) {
        event = line.slice(6).trim();
        return;
      }
      if (line.startsWith('id:')) {
        id = line.slice(3).trim();
        return;
      }
      if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trimStart());
      }
    });

    const data = dataLines.join('\n');
    if (data || event || id) {
      onFrame({ event, id, data });
    }

    boundaryIndex = current.indexOf('\n\n');
  }

  return current;
}

export async function streamChat({
  turnId,
  message,
  modelId,
  reasoningEffort,
  sessionId,
  attachments,
  signal,
  onEvent,
}: StreamChatOptions): Promise<void> {
  const token = getAccessToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}/turns/stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      turnId,
      message,
      modelId,
      reasoningEffort,
      attachments,
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

  const handleFrame = (frame: SseFrame) => {
    if (frame.data === '[DONE]') {
      done = true;
      return;
    }
    if (!frame.data) return;
    const event = chatStreamEventSchema.parse(JSON.parse(frame.data)) as ChatStreamEvent;
    onEvent(event);
    if (event.type === 'done') done = true;
    if (event.type === 'error') throw new Error(event.error.message);
  };

  while (!done) {
    const chunk = await reader.read();
    if (chunk.done) break;
    buffer += decoder.decode(chunk.value, { stream: true });
    buffer = consumeSseBuffer(buffer, handleFrame);
  }

  buffer += decoder.decode();
  consumeSseBuffer(buffer, handleFrame);
}

export async function cancelChat(sessionId: string): Promise<{ cancelled: boolean }> {
  return requestJson({
    url: `/api/sessions/${encodeURIComponent(sessionId)}/turns/cancel`,
    method: 'POST',
  });
}

export async function retrySessionMessage(input: {
  sessionId: string;
  messageId: string;
  modelId?: string | number;
  reasoningEffort?: 'low' | 'medium' | 'high';
}): Promise<{ session: SessionRecord; messages: UnifiedMessage[] }> {
  return requestJson({
    url: `/api/sessions/${input.sessionId}/messages/${input.messageId}/retry`,
    method: 'POST',
    data: {
      modelId: input.modelId,
      reasoningEffort: input.reasoningEffort,
    },
  });
}

export async function deleteSessionMessage(
  sessionId: string,
  messageId: string,
): Promise<{ session: SessionRecord; messages: UnifiedMessage[] }> {
  return requestJson({
    url: `/api/sessions/${sessionId}/messages/${messageId}`,
    method: 'DELETE',
  });
}

export async function fetchSpecState(sessionId: string): Promise<{
  sessionId: string;
  mode: 'spec';
  specWorkflow: SpecWorkflowState;
}> {
  return requestJson({
    url: `/api/spec/${sessionId}/state`,
    method: 'GET',
  });
}

export async function confirmSpecPhase(
  sessionId: string,
  input?: { selectedArtifacts?: string[]; actionAnswer?: string },
): Promise<{
  session: SessionRecord;
  messages: UnifiedMessage[];
  specWorkflow: SpecWorkflowState;
  progressed: boolean;
}> {
  return requestJson({
    url: `/api/spec/${sessionId}/confirm`,
    method: 'POST',
    data: {
      selectedArtifacts: input?.selectedArtifacts,
      actionAnswer: input?.actionAnswer,
    },
  });
}
