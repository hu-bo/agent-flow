export type EventLevel = 'debug' | 'info' | 'warn' | 'error';

export interface EventError {
  name: string;
  message: string;
  stack?: string;
}

export interface EventRecord {
  id: string;
  timestamp: string;
  level: EventLevel;
  name: string;
  message?: string;
  attributes?: Record<string, unknown>;
  traceId?: string;
  spanId?: string;
  parentSpanId?: string;
  durationMs?: number;
  error?: EventError;
}

export interface EventSink {
  emit(event: EventRecord): void | Promise<void>;
  flush?(): Promise<void>;
}

export interface LogContext {
  traceId?: string;
  spanId?: string;
  parentSpanId?: string;
  attributes?: Record<string, unknown>;
}

export interface TraceSpan {
  readonly traceId: string;
  readonly spanId: string;
  end(attributes?: Record<string, unknown>): Promise<void>;
  fail(error: unknown, attributes?: Record<string, unknown>): Promise<void>;
}
