import type { FilePart, UnifiedMessage } from '@agent-flow/model-contracts';

interface ApiErrorPayload {
  error?: string;
  code?: string;
}

export interface SessionRecord {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  modelId: string;
  cwd: string;
  messageCount: number;
  systemPrompt?: string;
}

export interface ModelDescriptor {
  modelId: string;
  displayName: string;
  provider: string;
  maxInputTokens: number;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    if (payload.error) return payload.error;
  } catch {
    // Fall through to text payload.
  }

  const text = await response.text().catch(() => '');
  return text || `Request failed: ${response.status}`;
}

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
  return response.json() as Promise<T>;
}

async function requestNoContent(input: RequestInfo | URL, init?: RequestInit): Promise<void> {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
}

export async function fetchHealth(): Promise<{ status: string; model: string }> {
  return requestJson('/api/health');
}

export async function fetchSessions(): Promise<{ sessions: SessionRecord[] }> {
  return requestJson('/api/sessions');
}

export async function fetchModels(): Promise<{ currentModel: string; models: ModelDescriptor[] }> {
  return requestJson('/api/models');
}

export async function fetchSession(
  sessionId: string,
): Promise<{ session: SessionRecord; messages: UnifiedMessage[] }> {
  return requestJson(`/api/sessions/${sessionId}`);
}

export async function createSession(opts?: {
  model?: string;
  systemPrompt?: string;
}): Promise<{ session: SessionRecord }> {
  return requestJson('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      modelId: opts?.model,
      systemPrompt: opts?.systemPrompt,
    }),
  });
}

export async function deleteSession(id: string): Promise<void> {
  await requestNoContent(`/api/sessions/${id}`, { method: 'DELETE' });
}

export async function switchModel(modelId: string): Promise<{ model: string }> {
  return requestJson('/api/model', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ modelId }),
  });
}

export async function triggerCompact(
  sessionId: string,
): Promise<{ sessionId: string; stats: unknown }> {
  return requestJson('/api/compact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, trigger: 'manual' }),
  });
}

interface StreamChatOptions {
  message: string;
  model?: string;
  reasoningEffort?: 'low' | 'medium' | 'high';
  sessionId: string;
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
  attachments,
  signal,
  onMessage,
}: StreamChatOptions): Promise<void> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      model,
      reasoningEffort,
      sessionId,
      attachments,
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
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
