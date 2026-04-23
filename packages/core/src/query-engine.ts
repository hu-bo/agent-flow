import type {
  UnifiedMessage,
  ChatResponse,
  StreamChunk,
  ToolDefinition,
} from './messages/index.js';
import type { ModelGateway } from './gateway/index.js';
import type { ContextStore } from './store/index.js';
import type { ContextCompressor } from './compressor/index.js';

export interface QueryEngineConfig {
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

/** QueryEngine â€?manages message assembly and model invocation */
export class QueryEngine {
  constructor(
    private gateway: ModelGateway,
    private contextStore: ContextStore,
    private compressor: ContextCompressor,
    private config: QueryEngineConfig = {},
  ) {}

  /** Send messages to model and get response */
  async query(tools?: ToolDefinition[]): Promise<ChatResponse> {
    const adapter = this.gateway.getAdapter();
    const messages = this.contextStore.getMessagesAfterCompactBoundary();
    return adapter.chat({
      messages,
      system: this.config.systemPrompt,
      tools: tools && tools.length > 0 ? tools : undefined,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
    });
  }

  /** Stream response from model */
  async *streamQuery(tools?: ToolDefinition[]): AsyncGenerator<StreamChunk> {
    const adapter = this.gateway.getAdapter();
    const messages = this.contextStore.getMessagesAfterCompactBoundary();
    for await (const chunk of adapter.streamChat({
      messages,
      system: this.config.systemPrompt,
      tools: tools && tools.length > 0 ? tools : undefined,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
    })) {
      yield chunk;
    }
  }

  /** Switch model at runtime */
  async switchModel(newModelId: string): Promise<void> {
    this.gateway.switchModel(newModelId);
  }

  /** Update system prompt */
  setSystemPrompt(prompt: string): void {
    this.config.systemPrompt = prompt;
  }
}

