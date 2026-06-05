import type { ChatResponse, StreamChunk, ToolDefinition } from './messages/index.js';
import type { ModelGateway } from './gateway/index.js';
import type { ContextStore } from './store/index.js';
import type { ContextCompressor } from './compressor/index.js';
export interface QueryEngineConfig {
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
}
/** QueryEngine �?manages message assembly and model invocation */
export declare class QueryEngine {
    private gateway;
    private contextStore;
    private compressor;
    private config;
    constructor(gateway: ModelGateway, contextStore: ContextStore, compressor: ContextCompressor, config?: QueryEngineConfig);
    /** Send messages to model and get response */
    query(tools?: ToolDefinition[]): Promise<ChatResponse>;
    /** Stream response from model */
    streamQuery(tools?: ToolDefinition[]): AsyncGenerator<StreamChunk>;
    /** Switch model at runtime */
    switchModel(newModelId: string): Promise<void>;
    /** Update system prompt */
    setSystemPrompt(prompt: string): void;
}
//# sourceMappingURL=query-engine.d.ts.map