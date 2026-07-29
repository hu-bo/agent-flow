import axios, { type AxiosRequestConfig } from 'axios';
import type { FilePart, TokenUsage, UnifiedMessage } from '@agent-flow/core/messages';

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
  details?: unknown;
}

export interface ApiBusinessErrorDetails {
  projectId?: string;
  projectName?: string;
  rootPath?: string;
  action?: string;
}

export class ApiBusinessError extends Error {
  readonly code: string | number;
  readonly details?: unknown;

  constructor(message: string, code: string | number, details?: unknown) {
    super(message);
    this.name = 'ApiBusinessError';
    this.code = code;
    this.details = details;
  }
}

export interface SessionRecord {
  sessionId: string;
  projectId: string | null;
  title?: string;
  createdAt: string;
  updatedAt: string;
  modelId: number;
  mode: 'vibe' | 'spec';
  cwd: string;
  messageCount: number;
  systemPrompt?: string;
  boundRunnerId?: string;
  specWorkflow?: SpecWorkflowState;
}

export interface ProjectRecord {
  projectId: string;
  name: string;
  rootPath: string;
  defaultRunnerId: string | null;
  createdAt: string;
  updatedAt: string;
  chatCount: number;
  latestSession?: SessionRecord;
}

export interface SpecWorkflowState {
  phase: 'requirements' | 'design' | 'tasks';
  awaitingConfirm: boolean;
  requirementsMsgId?: string;
  designMsgId?: string;
  taskListMsgId?: string;
  documents?: Partial<Record<SpecDocType, string>>;
}

export type SpecDocType = SpecWorkflowState['phase'];

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
  approval_ticket: string;
  ticket_id: string;
  expires_at: string;
  scope: {
    session_id: string;
    cmd: string;
    workdir: string;
  };
  approved_request_id?: string;
  persistent_grant_id?: string;
  decision?: 'once' | 'always';
}

export interface RunnerApprovalGrant {
  grantId: string;
  runnerId: string;
  scopeType: 'project' | 'chat';
  scopeId: string;
  scopeLabel?: string;
  coverage: 'all_high_risk';
  createdAt: string;
  lastUsedAt?: string;
}

export interface RunnerDirectoryEntry {
  path: string;
  name: string;
  type: 'directory' | 'file';
  size?: number;
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
    const response = await apiClient.request<ApiSuccessEnvelope<T>>(config);
    const envelope = response.data;
    if (typeof envelope?.code === 'number' && envelope.code !== 0) {
      throw new ApiBusinessError(
        envelope.message || 'Request failed',
        envelope.code,
        envelope.details,
      );
    }
    return envelope.data;
  } catch (error) {
    throw extractAxiosError(error);
  }
}

async function requestNoContent(config: AxiosRequestConfig): Promise<void> {
  try {
    const response = await apiClient.request<ApiSuccessEnvelope<unknown>>(config);
    const payload = response.data;
    if (payload && typeof payload === 'object' && typeof payload.code === 'number' && payload.code !== 0) {
      throw new ApiBusinessError(
        payload.message || 'Request failed',
        payload.code,
        payload.details,
      );
    }
  } catch (error) {
    throw extractAxiosError(error);
  }
}

export async function fetchHealth(): Promise<{ status: string; model: string }> {
  return requestJson({ url: '/api/health', method: 'GET' });
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

export async function fetchRunnerDownloads(): Promise<{
  downloadUrls: {
    windows: string;
    macos: string;
    linux: string;
  };
}> {
  return requestJson({ url: '/api/runners/downloads', method: 'GET' });
}

export type RunnerDownloadPlatform =
  | 'windows-amd64'
  | 'windows-arm64'
  | 'darwin-arm64'
  | 'darwin-amd64'
  | 'macos-arm64'
  | 'macos-amd64'
  | 'linux-amd64';

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

export async function rotateRunnerToken(): Promise<RunnerTokenIssueResult> {
  return requestJson({
    url: '/api/runners/token/rotate',
    method: 'POST',
    data: {},
  });
}

export async function issueRunnerApprovalTicket(input: {
  session_id: string;
  cmd: string;
  workdir?: string;
  request_id?: string;
  ttl_sec?: number;
  decision?: 'once' | 'always';
}): Promise<RunnerApprovalTicketResult> {
  return requestJson({
    url: '/api/runners/approval-ticket',
    method: 'POST',
    data: input,
  });
}

export async function fetchRunnerApprovalGrants(): Promise<{ grants: RunnerApprovalGrant[] }> {
  return requestJson({ url: '/api/runners/approval-grants', method: 'GET' });
}

export async function revokeRunnerApprovalGrant(grantId: string): Promise<void> {
  await requestNoContent({ url: `/api/runners/approval-grants/${grantId}`, method: 'DELETE' });
}

export async function bindSessionRunner(sessionId: string, runnerId: string): Promise<{
  session_id: string;
  runner_id: string;
}> {
  return requestJson({
    url: `/api/sessions/${sessionId}/runner-binding`,
    method: 'POST',
    data: { runner_id: runnerId },
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
  message: string;
  model_id?: string | number;
  reasoning_effort?: 'low' | 'medium' | 'high';
  session_id: string;
  project_id?: string;
  mode?: 'vibe' | 'spec';
  approve_risky_ops?: boolean;
  approval_ticket?: string;
  attachments?: FilePart[];
  signal?: AbortSignal;
  onDeltaApplied: (doc: StreamDoc) => void;
  onUsage?: (usage: UsageFrame, doc: StreamDoc) => void;
}

export type ApprovalRiskLevel = 'low' | 'medium' | 'high';

export interface ApprovalReqPayload {
  request_id?: string;
  session_id: string;
  runner_id?: string;
  scope_type?: 'project' | 'chat';
  scope_id?: string;
  scope_label?: string;
  cmd: string;
  workdir: string;
  risk: ApprovalRiskLevel;
  reason?: string;
}

export type StreamDoc = {
  messages: Record<string, UnifiedMessage>;
  order: string[];
  spec_docs: Partial<Record<SpecDocType, string>>;
  approval: null | ApprovalReqPayload;
  usage_by_msg: Record<string, TokenUsage>;
};

export type UsageFrame = {
  usage_by_msg: Record<string, TokenUsage>;
};

type FullDeltaFrame =
  | { p: string; o: 'add' | 'replace' | 'remove'; v?: unknown }
  | { p: string; o: 'append'; v: unknown };

type DeltaPatchFrame = { o: 'patch'; v: FullDeltaFrame[] };
type DeltaShorthandFrame = { v: string };
type DeltaFrame = FullDeltaFrame | DeltaPatchFrame | DeltaShorthandFrame;

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
  message,
  model_id,
  reasoning_effort,
  session_id,
  project_id,
  mode,
  approve_risky_ops,
  approval_ticket,
  attachments,
  signal,
  onDeltaApplied,
  onUsage,
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
      model_id,
      reasoning_effort,
      session_id,
      project_id,
      mode,
      approve_risky_ops: Boolean(approve_risky_ops),
      approval_ticket,
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

  let deltaEncoding: string | null = null;
  let lastAppendPatch: { p: string; o: 'append' } | null = null;

  let doc: StreamDoc = {
    messages: {},
    order: [],
    spec_docs: {},
    approval: null,
    usage_by_msg: {},
  };

  const applyDelta = (nextDoc: StreamDoc, frame: DeltaFrame): StreamDoc => {
    if (isDeltaShorthandFrame(frame)) {
      if (!lastAppendPatch) {
        throw new Error('Invalid delta shorthand frame: missing previous append operation');
      }
      return applyFullDelta(nextDoc, { p: lastAppendPatch.p, o: lastAppendPatch.o, v: frame.v });
    }

    if (isDeltaPatchFrame(frame)) {
      lastAppendPatch = null;
      return frame.v.reduce((acc, op) => applyFullDelta(acc, op), nextDoc);
    }

    if (frame.o === 'append') {
      lastAppendPatch = { p: frame.p, o: 'append' };
    } else {
      lastAppendPatch = null;
    }

    return applyFullDelta(nextDoc, frame);
  };

  const handleFrame = (frame: SseFrame) => {
    if (frame.data === '[DONE]') {
      done = true;
      return;
    }

    if (frame.event === 'error') {
      const payload = JSON.parse(frame.data) as { code?: string; message?: string };
      throw new Error(payload.message || 'Streaming failed');
    }

    if (frame.event === 'delta_encoding') {
      const parsed = JSON.parse(frame.data) as string;
      deltaEncoding = parsed;
      if (deltaEncoding !== 'v1') {
        throw new Error(`Unsupported delta encoding: ${deltaEncoding}`);
      }
      return;
    }

    if (frame.event === 'usage') {
      const usage = JSON.parse(frame.data) as UsageFrame;
      doc = {
        ...doc,
        usage_by_msg: { ...doc.usage_by_msg, ...(usage.usage_by_msg ?? {}) },
      };
      onUsage?.(usage, doc);
      onDeltaApplied(doc);
      return;
    }

    if (frame.event === 'approval_request') {
      const event = JSON.parse(frame.data) as {
        payload?: {
          requestId?: string;
          session_id?: string;
          runnerId?: string;
          scopeType?: 'project' | 'chat';
          scopeId?: string;
          scopeLabel?: string;
          cmd?: string;
          workdir?: string;
          risk?: ApprovalRiskLevel;
          reason?: string;
        };
      };
      const payload = event.payload ?? {};
      doc = {
        ...doc,
        approval: {
          request_id: payload.requestId,
          session_id: payload.session_id ?? '',
          runner_id: payload.runnerId,
          scope_type: payload.scopeType === 'project' ? 'project' : 'chat',
          scope_id: payload.scopeId,
          scope_label: payload.scopeLabel,
          cmd: payload.cmd ?? '',
          workdir: payload.workdir ?? '',
          risk: payload.risk === 'low' || payload.risk === 'medium' ? payload.risk : 'high',
          reason: payload.reason,
        },
      };
      onDeltaApplied(doc);
      return;
    }

    if (frame.event === 'approval_response') {
      doc = {
        ...doc,
        approval: null,
      };
      onDeltaApplied(doc);
      return;
    }

    if (frame.event === 'delta') {
      if (deltaEncoding !== 'v1') {
        // Allow servers that send delta before delta_encoding, but still enforce v1 once seen.
        deltaEncoding = deltaEncoding ?? 'v1';
      }
      const delta = JSON.parse(frame.data) as DeltaFrame;
      doc = applyDelta(doc, delta);
      onDeltaApplied(doc);
    }
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
    url: `/api/chat/${encodeURIComponent(sessionId)}/cancel`,
    method: 'POST',
  });
}

function isDeltaPatchFrame(frame: DeltaFrame): frame is DeltaPatchFrame {
  return (frame as DeltaPatchFrame).o === 'patch' && Array.isArray((frame as DeltaPatchFrame).v);
}

function isDeltaShorthandFrame(frame: DeltaFrame): frame is DeltaShorthandFrame {
  return (
    (frame as DeltaShorthandFrame).v !== undefined &&
    typeof (frame as DeltaShorthandFrame).v === 'string' &&
    (frame as Partial<FullDeltaFrame>).p === undefined
  );
}

function decodeJsonPointer(pointer: string): string[] {
  if (!pointer) return [];
  if (!pointer.startsWith('/')) {
    throw new Error(`Invalid JSON pointer: ${pointer}`);
  }
  return pointer
    .slice(1)
    .split('/')
    .map((token) => token.replace(/~1/g, '/').replace(/~0/g, '~'));
}

function isArrayIndexToken(token: string): boolean {
  return /^[0-9]+$/.test(token);
}

function cloneOrCreateContainer(value: unknown, wantArray: boolean): any {
  if (wantArray) {
    return Array.isArray(value) ? value.slice() : [];
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return { ...(value as Record<string, unknown>) };
  }
  return {};
}

function getChild(container: any, token: string): any {
  if (Array.isArray(container)) {
    const index = Number(token);
    if (!Number.isFinite(index)) return undefined;
    return container[index];
  }
  if (container && typeof container === 'object') {
    return container[token];
  }
  return undefined;
}

function setChild(container: any, token: string, value: any): void {
  if (Array.isArray(container)) {
    const index = Number(token);
    if (!Number.isFinite(index)) {
      throw new Error(`Invalid array index token: ${token}`);
    }
    container[index] = value;
    return;
  }
  if (container && typeof container === 'object') {
    container[token] = value;
    return;
  }
  throw new Error(`Cannot set child on non-container value: ${String(container)}`);
}

function removeChild(container: any, token: string): void {
  if (Array.isArray(container)) {
    const index = Number(token);
    if (!Number.isFinite(index)) return;
    container.splice(index, 1);
    return;
  }
  if (container && typeof container === 'object') {
    delete container[token];
  }
}

function getAtPointer(root: any, tokens: string[]): any {
  let current = root;
  for (const token of tokens) {
    if (current == null) return undefined;
    current = getChild(current, token);
  }
  return current;
}

function setAtPointer<T>(root: T, pointer: string, value: unknown): T {
  const tokens = decodeJsonPointer(pointer);
  if (tokens.length === 0) {
    return value as T;
  }

  const nextRoot = cloneOrCreateContainer(root as unknown, Array.isArray(root));
  let nextCursor: any = nextRoot;
  let prevCursor: any = root;

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const isLast = index === tokens.length - 1;

    if (isLast) {
      setChild(nextCursor, token, value);
      break;
    }

    const nextToken = tokens[index + 1];
    const wantArray = isArrayIndexToken(nextToken);
    const prevChild = getChild(prevCursor, token);
    const ensuredPrevChild = wantArray
      ? (Array.isArray(prevChild) ? prevChild : [])
      : (prevChild && typeof prevChild === 'object' && !Array.isArray(prevChild) ? prevChild : {});
    const clonedChild = cloneOrCreateContainer(ensuredPrevChild, wantArray);
    setChild(nextCursor, token, clonedChild);
    nextCursor = clonedChild;
    prevCursor = ensuredPrevChild;
  }

  return nextRoot as T;
}

function removeAtPointer<T>(root: T, pointer: string): T {
  const tokens = decodeJsonPointer(pointer);
  if (tokens.length === 0) {
    return root;
  }

  const nextRoot = cloneOrCreateContainer(root as unknown, Array.isArray(root));
  let nextCursor: any = nextRoot;
  let prevCursor: any = root;

  for (let index = 0; index < tokens.length - 1; index += 1) {
    const token = tokens[index];
    const nextToken = tokens[index + 1];
    const wantArray = isArrayIndexToken(nextToken);
    const prevChild = getChild(prevCursor, token);
    const ensuredPrevChild = wantArray
      ? (Array.isArray(prevChild) ? prevChild : [])
      : (prevChild && typeof prevChild === 'object' && !Array.isArray(prevChild) ? prevChild : {});
    const clonedChild = cloneOrCreateContainer(ensuredPrevChild, wantArray);
    setChild(nextCursor, token, clonedChild);
    nextCursor = clonedChild;
    prevCursor = ensuredPrevChild;
  }

  removeChild(nextCursor, tokens[tokens.length - 1]);
  return nextRoot as T;
}

function appendAtPointer<T>(root: T, pointer: string, value: unknown): T {
  const tokens = decodeJsonPointer(pointer);
  const current = getAtPointer(root, tokens);

  if (typeof current === 'string') {
    return setAtPointer(root, pointer, `${current}${String(value ?? '')}`);
  }

  if (Array.isArray(current)) {
    if (Array.isArray(value)) {
      return setAtPointer(root, pointer, [...current, ...value]);
    }
    return setAtPointer(root, pointer, [...current, value]);
  }

  if (current === undefined || current === null) {
    if (typeof value === 'string') {
      return setAtPointer(root, pointer, value);
    }
    if (Array.isArray(value)) {
      return setAtPointer(root, pointer, [...value]);
    }
    return setAtPointer(root, pointer, value);
  }

  if (typeof current === 'object') {
    // Fallback: treat append as replace for non-string/object values.
    return setAtPointer(root, pointer, value);
  }

  return setAtPointer(root, pointer, value);
}

function applyFullDelta(doc: StreamDoc, frame: FullDeltaFrame): StreamDoc {
  if (frame.o === 'remove') {
    return removeAtPointer(doc, frame.p);
  }
  if (frame.o === 'append') {
    return appendAtPointer(doc, frame.p, frame.v);
  }
  return setAtPointer(doc, frame.p, frame.v);
}

export async function retrySessionMessage(input: {
  session_id: string;
  msg_id: string;
  model_id?: string | number;
  reasoning_effort?: 'low' | 'medium' | 'high';
}): Promise<{ session: SessionRecord; messages: UnifiedMessage[] }> {
  return requestJson({
    url: `/api/chat/${input.session_id}/retry`,
    method: 'POST',
    data: {
      msg_id: input.msg_id,
      model_id: input.model_id,
      reasoning_effort: input.reasoning_effort,
    },
  });
}

export async function deleteSessionMessage(
  session_id: string,
  msg_id: string,
): Promise<{ session: SessionRecord; messages: UnifiedMessage[] }> {
  return requestJson({
    url: `/api/chat/${session_id}/messages/${msg_id}`,
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
      selected_artifacts: input?.selectedArtifacts,
      action_answer: input?.actionAnswer,
    },
  });
}
