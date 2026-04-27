import type { EventRecord, EventSink } from './types.js';

export class MemoryEventSink implements EventSink {
  private readonly events: EventRecord[] = [];

  emit(event: EventRecord): void {
    this.events.push({
      ...event,
      attributes: event.attributes ? { ...event.attributes } : undefined,
      error: event.error ? { ...event.error } : undefined,
    });
  }

  list(): EventRecord[] {
    return this.events.map((event) => ({
      ...event,
      attributes: event.attributes ? { ...event.attributes } : undefined,
      error: event.error ? { ...event.error } : undefined,
    }));
  }

  clear(): void {
    this.events.length = 0;
  }
}

export class ConsoleEventSink implements EventSink {
  emit(event: EventRecord): void {
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
