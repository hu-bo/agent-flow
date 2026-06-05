import pino from 'pino';

interface CreateLoggerOptions {
    logLevel?: pino.LevelWithSilent;
    logDir?: string;
    output?: 'file' | 'pretty';
    envLabel?: string;
}
declare function createLogger(service: string, options?: CreateLoggerOptions): pino.Logger<never, boolean>;

export { type CreateLoggerOptions, createLogger };
