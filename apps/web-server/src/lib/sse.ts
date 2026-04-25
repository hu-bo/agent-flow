import type { FastifyReply } from 'fastify';

export interface SseStream {
  comment(text: string): void;
  send(data: unknown, event?: string): void;
  done(): void;
  close(): void;
}

export function createSseStream(
  reply: FastifyReply,
  options: { heartbeatMs?: number } = {},
): SseStream {
  const heartbeatMs = options.heartbeatMs ?? 15_000;
  const raw = reply.raw;
  let closed = false;

  reply.hijack();
  raw.statusCode = 200;
  raw.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  raw.setHeader('Cache-Control', 'no-cache, no-transform');
  raw.setHeader('Connection', 'keep-alive');
  raw.setHeader('X-Accel-Buffering', 'no');
  raw.flushHeaders?.();

  const close = () => {
    if (closed) return;
    closed = true;
    clearInterval(heartbeat);
    raw.end();
  };

  raw.on('close', () => {
    closed = true;
    clearInterval(heartbeat);
  });

  const writeFrame = (lines: string[]) => {
    if (closed) return;
    raw.write(`${lines.join('\n')}\n\n`);
  };

  const heartbeat = setInterval(() => {
    writeFrame([':keepalive']);
  }, heartbeatMs);
  heartbeat.unref?.();

  return {
    comment(text: string) {
      writeFrame([`:${text}`]);
    },
    send(data: unknown, event?: string) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      const lines = event ? [`event: ${event}`, `data: ${payload}`] : [`data: ${payload}`];
      writeFrame(lines);
    },
    done() {
      writeFrame(['data: [DONE]']);
      close();
    },
    close,
  };
}
