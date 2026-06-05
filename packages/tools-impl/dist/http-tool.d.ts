import type { ToolDefinition, ToolSchema } from '@agent-flow/core';
export interface HttpToolInput {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
    timeoutMs?: number;
}
export interface HttpToolOutput {
    status: number;
    statusText: string;
    ok: boolean;
    headers: Record<string, string>;
    body: unknown;
}
export declare class HttpTool implements ToolDefinition<HttpToolInput, HttpToolOutput> {
    readonly schema: ToolSchema;
    execute(input: HttpToolInput): Promise<HttpToolOutput>;
}
//# sourceMappingURL=http-tool.d.ts.map