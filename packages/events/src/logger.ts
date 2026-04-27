import { randomUUID } from 'node:crypto';
import type { EventLevel, EventRecord, EventSink, LogContext } from './types.js';

export interface StructuredLoggerOptions {
  sinks?: EventSink[];
  defaultAttributes?: Record<string, unknown>;
}

export class StructuredLogger {
  private readonly sinks: EventSink[];
  private readonly defaultAttributes: Record<string, unknown>;

  constructor(options: StructuredLoggerOptions = {}) {
    this.sinks = options.sinks ?? [];
    this.defaultAttributes = options.defaultAttributes ?? {};
  }

  child(attributes: Record<string, unknown>): StructuredLogger {
    return new StructuredLogger({
      sinks: this.sinks,
      defaultAttributes: {
        ...this.defaultAttributes,
        ...attributes,
      },
    });
  }

  async debug(name: string, message?: string, context: LogContext = {}): Promise<void> {
    await this.log('debug', name, message, context);
  }

  async info(name: string, message?: string, context: LogContext = {}): Promise<void> {
    await this.log('info', name, message, context);
  }

  async warn(name: string, message?: string, context: LogContext = {}): Promise<void> {
    await this.log('warn', name, message, context);
  }

  async error(name: string, message?: string, context: LogContext = {}): Promise<void> {
    await this.log('error', name, message, context);
  }

  async emit(event: EventRecord): Promise<void> {
    for (const sink of this.sinks) {
      await sink.emit(event);
    }
  }

  private async log(level: EventLevel, name: string, message: string | undefined, context: LogContext): Promise<void> {
    await this.emit({
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      level,
      name,
      message,
      traceId: context.traceId,
      spanId: context.spanId,
      parentSpanId: context.parentSpanId,
      attributes: {
        ...this.defaultAttributes,
        ...(context.attributes ?? {}),
      },
    });
  }
}
