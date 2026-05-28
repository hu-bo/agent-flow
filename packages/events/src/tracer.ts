import { randomUUID } from 'node:crypto';
import { StructuredLogger } from './logger.js';
import type { TraceSpan } from './types.js';

export interface TracerOptions {
  logger: StructuredLogger;
}

export interface StartSpanOptions {
  traceId?: string;
  parentSpanId?: string;
  attributes?: Record<string, unknown>;
}

export class Tracer {
  private readonly logger: StructuredLogger;

  constructor(options: TracerOptions) {
    this.logger = options.logger;
  }

  async startSpan(name: string, options: StartSpanOptions = {}): Promise<TraceSpan> {
    const traceId = options.traceId ?? randomUUID();
    const spanId = randomUUID();
    const startedAt = Date.now();

    await this.logger.info(`${name}.start`, 'span started', {
      traceId,
      spanId,
      parentSpanId: options.parentSpanId,
      attributes: options.attributes,
    });

    return {
      traceId,
      spanId,
      end: async (attributes?: Record<string, unknown>) => {
        await this.logger.info(`${name}.end`, 'span finished', {
          traceId,
          spanId,
          parentSpanId: options.parentSpanId,
          attributes: {
            ...(options.attributes ?? {}),
            ...(attributes ?? {}),
            durationMs: Date.now() - startedAt,
          },
        });
      },
      fail: async (error: unknown, attributes?: Record<string, unknown>) => {
        await this.logger.emit({
          id: randomUUID(),
          timestamp: new Date().toISOString(),
          level: 'error',
          name: `${name}.error`,
          message: 'span failed',
          traceId,
          spanId,
          parentSpanId: options.parentSpanId,
          durationMs: Date.now() - startedAt,
          attributes: {
            ...(options.attributes ?? {}),
            ...(attributes ?? {}),
          },
          error: normalizeError(error),
        });
      },
    };
  }
}

function normalizeError(error: unknown): { name: string; message: string; stack?: string; cause?: unknown; extra?: Record<string, unknown> } {
  if (error instanceof Error) {
    const cause = (error as unknown as { cause?: unknown }).cause;
    const extra = extractExtraErrorProps(error);
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(cause !== undefined ? { cause: normalizeError(cause) } : {}),
      ...(extra ? { extra } : {}),
    };
  }
  const extra = extractExtraErrorProps(error);
  return {
    name: 'UnknownError',
    message: String(error),
    ...(extra ? { extra } : {}),
  };
}

function extractExtraErrorProps(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const obj = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const key of Object.getOwnPropertyNames(obj)) {
    if (key === 'name' || key === 'message' || key === 'stack' || key === 'cause') {
      continue;
    }

    const lowered = key.toLowerCase();
    if (
      lowered.includes('key') ||
      lowered.includes('token') ||
      lowered.includes('secret') ||
      lowered.includes('authorization')
    ) {
      continue;
    }

    result[key] = sanitizeErrorValue(obj[key]);
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function sanitizeErrorValue(value: unknown): unknown {
  if (typeof value === 'string') {
    const max = 24_000;
    return value.length > max ? `${value.slice(0, max)}... (truncated)` : value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => sanitizeErrorValue(item));
  }

  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    let count = 0;
    for (const [k, v] of Object.entries(obj)) {
      if (count >= 50) break;
      const lowered = k.toLowerCase();
      if (
        lowered.includes('key') ||
        lowered.includes('token') ||
        lowered.includes('secret') ||
        lowered.includes('authorization')
      ) {
        continue;
      }
      out[k] = sanitizeErrorValue(v);
      count += 1;
    }
    return out;
  }

  return value;
}
