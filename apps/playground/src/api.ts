export async function fetchHealth(): Promise<{ status: string; model: string }> {
  const res = await fetch('/api/health');
  return res.json();
}

export async function fetchSessions(): Promise<{ sessions: unknown[] }> {
  const res = await fetch('/api/sessions');
  return res.json();
}

export async function createSession(opts?: {
  model?: string;
  systemPrompt?: string;
}): Promise<unknown> {
  const res = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      modelId: opts?.model,
      systemPrompt: opts?.systemPrompt,
    }),
  });
  return res.json();
}

export async function deleteSession(id: string): Promise<void> {
  await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
}

export async function switchModel(modelId: string): Promise<void> {
  await fetch('/api/model', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ modelId }),
  });
}

export async function triggerCompact(): Promise<void> {
  await fetch('/api/compact', { method: 'POST' });
}

export function createWebSocket(): WebSocket {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  return new WebSocket(`${proto}://${location.host}/ws`);
}
