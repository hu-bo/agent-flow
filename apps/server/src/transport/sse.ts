import type { Context } from 'hono';

const encoder = new TextEncoder();

export interface SseOptions {
  heartbeatMs?: number;
  retryMs?: number;
}

export interface SseSession {
  signal: AbortSignal;
  isClosed: () => boolean;
  sendJson: (payload: unknown, event?: string) => Promise<boolean>;
  sendDone: () => Promise<boolean>;
  sendComment: (comment: string) => Promise<boolean>;
}

function toSseFrame(data: string, event?: string): string {
  const lines = data.split(/\r?\n/);
  const prefix = event ? `event: ${event}\n` : '';
  const payload = lines.map((line) => `data: ${line}`).join('\n');
  return `${prefix}${payload}\n\n`;
}

export function createSseResponse(
  c: Context,
  handler: (session: SseSession) => Promise<void>,
  options: SseOptions = {},
): Response {
  const heartbeatMs = options.heartbeatMs ?? 15_000;
  const retryMs = options.retryMs ?? 3_000;

  const { readable, writable } = new TransformStream<Uint8Array>();
  const writer = writable.getWriter();
  const signal = c.req.raw.signal;
  let closed = false;
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const close = async () => {
    if (closed) return;
    closed = true;
    if (heartbeat) clearInterval(heartbeat);
    try {
      await writer.close();
    } catch {
      // Ignore close errors from disconnected clients.
    }
  };

  const writeRaw = async (chunk: string): Promise<boolean> => {
    if (closed || signal.aborted) return false;
    try {
      await writer.ready;
      await writer.write(encoder.encode(chunk));
      return true;
    } catch {
      await close();
      return false;
    }
  };

  const sendJson = async (payload: unknown, event?: string): Promise<boolean> => {
    return writeRaw(toSseFrame(JSON.stringify(payload), event));
  };

  const sendDone = async (): Promise<boolean> => {
    return writeRaw(toSseFrame('[DONE]'));
  };

  const sendComment = async (comment: string): Promise<boolean> => {
    return writeRaw(`: ${comment}\n\n`);
  };

  signal.addEventListener(
    'abort',
    () => {
      void close();
    },
    { once: true },
  );

  void (async () => {
    await writeRaw(`retry: ${retryMs}\n\n`);
    await sendComment('connected');

    heartbeat = setInterval(() => {
      void sendComment('heartbeat');
    }, heartbeatMs);

    try {
      await handler({
        signal,
        isClosed: () => closed || signal.aborted,
        sendJson,
        sendDone,
        sendComment,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown stream error';
      await sendJson({ error: message }, 'error');
    } finally {
      await close();
    }
  })();

  return c.newResponse(readable, 200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
}

