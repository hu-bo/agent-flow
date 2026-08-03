export declare class AgentFlowError extends Error {
    readonly code: string;
    readonly retryable: boolean;
    constructor(message: string, code: string, retryable?: boolean);
}
export declare class ModelError extends AgentFlowError {
    readonly provider?: string | undefined;
    readonly modelId?: string | undefined;
    constructor(message: string, code: string, retryable?: boolean, provider?: string | undefined, modelId?: string | undefined);
}
export declare class RateLimitError extends ModelError {
    readonly retryAfterMs?: number | undefined;
    constructor(message: string, retryAfterMs?: number | undefined, provider?: string, modelId?: string);
}
export declare class ContextTooLongError extends ModelError {
    readonly currentTokens: number;
    readonly maxTokens: number;
    constructor(message: string, currentTokens: number, maxTokens: number, provider?: string, modelId?: string);
}
