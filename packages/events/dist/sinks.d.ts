import type { EventRecord, EventSink } from './types.js';
export declare class MemoryEventSink implements EventSink {
    private readonly events;
    emit(event: EventRecord): void;
    list(): EventRecord[];
    clear(): void;
}
export declare class ConsoleEventSink implements EventSink {
    emit(event: EventRecord): void;
}
//# sourceMappingURL=sinks.d.ts.map