import { randomUUID } from 'node:crypto';
export class StructuredLogger {
    sinks;
    defaultAttributes;
    constructor(options = {}) {
        this.sinks = options.sinks ?? [];
        this.defaultAttributes = options.defaultAttributes ?? {};
    }
    child(attributes) {
        return new StructuredLogger({
            sinks: this.sinks,
            defaultAttributes: {
                ...this.defaultAttributes,
                ...attributes,
            },
        });
    }
    async debug(name, message, context = {}) {
        await this.log('debug', name, message, context);
    }
    async info(name, message, context = {}) {
        await this.log('info', name, message, context);
    }
    async warn(name, message, context = {}) {
        await this.log('warn', name, message, context);
    }
    async error(name, message, context = {}) {
        await this.log('error', name, message, context);
    }
    async emit(event) {
        for (const sink of this.sinks) {
            await sink.emit(event);
        }
    }
    async log(level, name, message, context) {
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
