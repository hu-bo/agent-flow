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

function normalizeError(error: unknown): { name: string; message: string; stack?: string } {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return {
    name: 'UnknownError',
    message: String(error),
  };
}
