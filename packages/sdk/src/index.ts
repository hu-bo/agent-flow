import type {
  UnifiedMessage,
  ToolDefinition,
  ProviderAdapter,
} from '@agent-flow/model-contracts';
import { ModelGateway } from '@agent-flow/model-gateway';
import { ContextStore, SessionManager } from '@agent-flow/context-store';
import { ContextCompressor } from '@agent-flow/context-compressor';
import type { CompactionResult } from '@agent-flow/context-compressor';
import { LocalCheckpointManager } from '@agent-flow/checkpoint';
import { Agent, QueryEngine, ToolRegistry, PermissionManager } from '@agent-flow/core';
import type { ToolExecutor } from '@agent-flow/core';

export interface AgentFlowConfig {
  defaultModel: string;
  systemPrompt?: string;
  sessionDir?: string;
  checkpointDir?: string;
  maxTurns?: number;
}

export class AgentFlow {
  private gateway: ModelGateway;
  private contextStore: ContextStore;
  private sessionManager: SessionManager;
  private checkpointManager: LocalCheckpointManager;
  private toolRegistry: ToolRegistry;
  private permissionManager: PermissionManager;
  private config: AgentFlowConfig;

  constructor(config: AgentFlowConfig) {
    this.config = config;
    this.gateway = new ModelGateway({ defaultModel: config.defaultModel });
    this.contextStore = new ContextStore();
    this.sessionManager = new SessionManager(config.sessionDir ?? '.agent-flow/sessions');
    this.checkpointManager = new LocalCheckpointManager(config.checkpointDir ?? '.agent-flow/checkpoints');
    this.toolRegistry = new ToolRegistry();
    this.permissionManager = new PermissionManager();
  }

  registerAdapter(modelId: string, adapter: ProviderAdapter): void {
    this.gateway.registerAdapter(modelId, adapter);
  }

  registerTool(definition: ToolDefinition, executor: ToolExecutor): void {
    this.toolRegistry.register(definition, executor);
  }

  async *chat(message: string): AsyncGenerator<UnifiedMessage> {
    const adapter = this.gateway.getAdapter();
    const compressor = new ContextCompressor(adapter);
    const queryEngine = new QueryEngine(
      this.gateway,
      this.contextStore,
      compressor,
      { systemPrompt: this.config.systemPrompt },
    );

    const agent = new Agent(queryEngine, {
      modelId: this.config.defaultModel,
      systemPrompt: this.config.systemPrompt,
      maxTurns: this.config.maxTurns,
    }, {
      contextStore: this.contextStore,
      toolRegistry: this.toolRegistry,
      compressor,
      checkpointManager: this.checkpointManager,
      permissionManager: this.permissionManager,
    });

    yield* agent.run(message);
  }

  async switchModel(modelId: string): Promise<void> {
    this.gateway.switchModel(modelId);
  }

  async compact(): Promise<CompactionResult> {
    const adapter = this.gateway.getAdapter();
    const compressor = new ContextCompressor(adapter);
    const messages = this.contextStore.getMessages();
    return compressor.compact(messages, { trigger: 'manual' });
  }

  getSession(): { messages: UnifiedMessage[]; model: string } {
    return {
      messages: this.contextStore.getMessages(),
      model: this.gateway.resolveModel(),
    };
  }

  async resume(sessionId: string): Promise<void> {
    const session = this.sessionManager.loadSession(sessionId);
    if (session) {
      this.contextStore.appendMessages(session.messages);
    }
  }

  listSessions() {
    return this.sessionManager.listSessions();
  }

  getToolRegistry(): ToolRegistry {
    return this.toolRegistry;
  }

  getGateway(): ModelGateway {
    return this.gateway;
  }
}

// Re-export commonly used types
export type { UnifiedMessage, ToolDefinition, ProviderAdapter } from '@agent-flow/model-contracts';
export type { AgentConfig } from '@agent-flow/core';
export type { CompactionResult } from '@agent-flow/context-compressor';
