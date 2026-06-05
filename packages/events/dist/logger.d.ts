import type { EventRecord, EventSink, LogContext } from './types.js';
export interface StructuredLoggerOptions {
    sinks?: EventSink[];
    defaultAttributes?: Record<string, unknown>;
}
export declare class StructuredLogger {
    private readonly sinks;
    private readonly defaultAttributes;
    constructor(options?: StructuredLoggerOptions);
    child(attributes: Record<string, unknown>): StructuredLogger;
    debug(name: string, message?: string, context?: LogContext): Promise<void>;
    info(name: string, message?: string, context?: LogContext): Promise<void>;
    warn(name: string, message?: string, context?: LogContext): Promise<void>;
    error(name: string, message?: string, context?: LogContext): Promise<void>;
    emit(event: EventRecord): Promise<void>;
    private log;
}
//# sourceMappingURL=logger.d.ts.map