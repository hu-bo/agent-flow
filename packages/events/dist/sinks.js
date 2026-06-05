export class MemoryEventSink {
    events = [];
    emit(event) {
        this.events.push({
            ...event,
            attributes: event.attributes ? { ...event.attributes } : undefined,
            error: event.error ? { ...event.error } : undefined,
        });
    }
    list() {
        return this.events.map((event) => ({
            ...event,
            attributes: event.attributes ? { ...event.attributes } : undefined,
            error: event.error ? { ...event.error } : undefined,
        }));
    }
    clear() {
        this.events.length = 0;
    }
}
export class ConsoleEventSink {
    emit(event) {
        const payload = JSON.stringify(event);
        switch (event.level) {
            case 'debug':
                console.debug(payload);
                break;
            case 'info':
                console.info(payload);
                break;
            case 'warn':
                console.warn(payload);
                break;
            case 'error':
                console.error(payload);
                break;
        }
    }
}
//# sourceMappingURL=sinks.js.map