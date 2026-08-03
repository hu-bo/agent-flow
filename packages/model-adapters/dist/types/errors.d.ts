export declare class AdapterError extends Error {
    readonly code: string;
    readonly retryable: boolean;
    readonly provider?: string;
    readonly model?: string;
    constructor(message: string, code: string, retryable?: boolean, provider?: string, model?: string);
}
export declare class RateLimitAdapterError extends AdapterError {
    readonly retryAfterMs?: number;
    constructor(message: string, provider?: string, model?: string, retryAfterMs?: number);
}
export declare class ContextWindowAdapterError extends AdapterError {
    readonly inputTokens: number;
    readonly limit: number;
    constructor(message: string, inputTokens: number, limit: number, provider?: string, model?: string);
}
