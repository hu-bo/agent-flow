import type { EventRecord, EventSink } from '@agent-flow/events';
import { createLogger, type CreateLoggerOptions } from '@agent-flow/logger-js';

export interface PinoEventSinkOptions extends CreateLoggerOptions {
  service: string;
}

export class PinoEventSink implements EventSink {
  private readonly logger: ReturnType<typeof createLogger>;

  constructor(options: PinoEventSinkOptions) {
    this.logger = createLogger(options.service, {
      logLevel: options.logLevel,
      logDir: options.logDir,
      output: options.output,
      envLabel: options.envLabel,
    });
  }

  emit(event: EventRecord): void {
    const message = event.message ?? event.name;
    const payload = {
      event,
      ...(event.error ? { err: event.error } : {}),
    };

    switch (event.level) {
      case 'debug':
        this.logger.debug(payload, message);
        break;
      case 'info':
        this.logger.info(payload, message);
        break;
      case 'warn':
        this.logger.warn(payload, message);
        break;
      case 'error':
        this.logger.error(payload, message);
        break;
    }
  }
}
