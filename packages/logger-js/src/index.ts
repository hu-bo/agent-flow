import { createWriteStream, mkdirSync, type WriteStream } from 'node:fs';
import path from 'node:path';
import { Writable } from 'node:stream';
import pino from 'pino';

export interface CreateLoggerOptions {
  logLevel?: pino.LevelWithSilent;
  logDir?: string;
  output?: 'file' | 'pretty';
  envLabel?: string;
}

function toLocalDateLabel(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

class DailyFileStream extends Writable {
  private readonly logDir: string;
  private currentDate = '';
  private stream: WriteStream | null = null;

  constructor(logDir: string) {
    super();
    this.logDir = path.resolve(logDir);
    mkdirSync(this.logDir, { recursive: true });
  }

  private ensureStream(now: Date): WriteStream {
    const dateLabel = toLocalDateLabel(now);
    if (this.stream && this.currentDate === dateLabel) {
      return this.stream;
    }

    if (this.stream) {
      this.stream.end();
      this.stream = null;
    }

    this.currentDate = dateLabel;
    const filePath = path.join(this.logDir, `LLM-${dateLabel}.log`);
    this.stream = createWriteStream(filePath, { flags: 'a' });
    return this.stream;
  }

  override _write(
    chunk: Buffer | string,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ): void {
    const stream = this.ensureStream(new Date());
    stream.write(chunk, encoding, callback);
  }

  override _final(callback: (error?: Error | null) => void): void {
    if (!this.stream) {
      callback();
      return;
    }

    this.stream.end(callback);
    this.stream = null;
    this.currentDate = '';
  }
}

function createPrettyTransport(): pino.TransportSingleOptions {
  return {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname',
    },
  };
}

export function createLogger(service: string, options: CreateLoggerOptions = {}) {
  if (!service) {
    throw new Error('service name is required for logger initialization');
  }

  const logLevel = options.logLevel ?? 'info';
  const logDir = options.logDir ?? 'logs';
  const output = options.output ?? 'file';
  const envLabel = options.envLabel ?? 'production';
  const destination =
    output === 'pretty'
      ? pino.transport(createPrettyTransport())
      : new DailyFileStream(logDir);

  const baseLogger = pino(
    {
      level: logLevel,
      base: {
        pid: process.pid,
        service,
        env: envLabel,
      },
      timestamp: () => `,"time":"${new Date().toISOString()}"`,
    },
    destination
  );

  const originalChild = baseLogger.child.bind(baseLogger);

  function createScopedChild(scopeOrBindings: string | pino.Bindings) {
    if (typeof scopeOrBindings === 'string') {
      return originalChild({ scope: scopeOrBindings });
    }
    return originalChild(scopeOrBindings);
  }

  (baseLogger as unknown as { child: typeof createScopedChild }).child = createScopedChild;
  return baseLogger;
}
