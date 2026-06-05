import { randomUUID } from 'node:crypto';
import { StructuredLogger } from './logger.js';
export class Tracer {
    logger;
    constructor(options) {
        this.logger = options.logger;
    }
    async startSpan(name, options = {}) {
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
            end: async (attributes) => {
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
            fail: async (error, attributes) => {
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
function normalizeError(error) {
    if (error instanceof Error) {
        const cause = error.cause;
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
function extractExtraErrorProps(value) {
    if (!value || typeof value !== 'object') {
        return undefined;
    }
    const obj = value;
    const result = {};
    for (const key of Object.getOwnPropertyNames(obj)) {
        if (key === 'name' || key === 'message' || key === 'stack' || key === 'cause') {
            continue;
        }
        const lowered = key.toLowerCase();
        if (lowered.includes('key') ||
            lowered.includes('token') ||
            lowered.includes('secret') ||
            lowered.includes('authorization')) {
            continue;
        }
        result[key] = sanitizeErrorValue(obj[key]);
    }
    return Object.keys(result).length > 0 ? result : undefined;
}
function sanitizeErrorValue(value) {
    if (typeof value === 'string') {
        const max = 24_000;
        return value.length > max ? `${value.slice(0, max)}... (truncated)` : value;
    }
    if (Array.isArray(value)) {
        return value.slice(0, 50).map((item) => sanitizeErrorValue(item));
    }
    if (value && typeof value === 'object') {
        const obj = value;
        const out = {};
        let count = 0;
        for (const [k, v] of Object.entries(obj)) {
            if (count >= 50)
                break;
            const lowered = k.toLowerCase();
            if (lowered.includes('key') ||
                lowered.includes('token') ||
                lowered.includes('secret') ||
                lowered.includes('authorization')) {
                continue;
            }
            out[k] = sanitizeErrorValue(v);
            count += 1;
        }
        return out;
    }
    return value;
}
//# sourceMappingURL=tracer.js.map