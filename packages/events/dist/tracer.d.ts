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
export declare class Tracer {
    private readonly logger;
    constructor(options: TracerOptions);
    startSpan(name: string, options?: StartSpanOptions): Promise<TraceSpan>;
}
//# sourceMappingURL=tracer.d.ts.map