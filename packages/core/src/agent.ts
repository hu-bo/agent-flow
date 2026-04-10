import * as crypto from 'crypto';
import type {
  UnifiedMessage,
  ChatResponse,
  ToolDefinition,
  ContentPart,
  ToolCallPart,
  ToolResultPart,
  TokenUsage,
} from '@agent-flow/model-contracts';
import { QueryEngine } from './query-engine';
import type { ContextStore } from '@agent-flow/context-store';
import type { ContextCompressor, CompactionResult } from '@agent-flow/context-compressor';
import { shouldAutoCompact } from '@agent-flow/context-compressor';
import type { LocalCheckpointManager, Checkpoint } from '@agent-flow/checkpoint';
import { ToolRegistry } from './tool-registry';
import { PermissionManager } from './permission';

export interface AgentConfig {
  modelId: string;
  systemPrompt?: string;
  tools?: string[];
  maxTurns?: number;
}

export interface AgentDependencies {
  contextStore: ContextStore;
  toolRegistry: ToolRegistry;
  compressor: ContextCompressor;
  checkpointManager: LocalCheckpointManager;
  permissionManager: PermissionManager;
}

/** Agent — orchestrates the main conversation loop */
export class Agent {
  private queryEngine: QueryEngine;
  private config: AgentConfig;
  private contextStore: ContextStore;
  private toolRegistry: ToolRegistry;
  private compressor: ContextCompressor;
  private checkpointManager: LocalCheckpointManager;
  private permissionManager: PermissionManager;
  private totalUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

  constructor(queryEngine: QueryEngine, config: AgentConfig, deps: AgentDependencies) {
    this.queryEngine = queryEngine;
    this.config = config;
    this.contextStore = deps.contextStore;
    this.toolRegistry = deps.toolRegistry;
    this.compressor = deps.compressor;
    this.checkpointManager = deps.checkpointManager;
    this.permissionManager = deps.permissionManager;
  }

  async *run(userMessage: string): AsyncGenerator<UnifiedMessage> {
    const maxTurns = this.config.maxTurns ?? 50;

    // 1. Create and append user message
    const userMsg = this.createMessage('user', [{ type: 'text', text: userMessage }]);
    this.contextStore.appendMessage(userMsg);
    yield userMsg;

    // 2. Agentic loop
    for (let turn = 0; turn < maxTurns; turn++) {
      // Get tool definitions
      const tools = this.toolRegistry.getDefinitions();

      // Query model
      const response = await this.queryEngine.query(tools);
      const assistantMsg = response.message;

      // Track usage
      if (response.usage) {
        this.totalUsage.promptTokens += response.usage.promptTokens;
        this.totalUsage.completionTokens += response.usage.completionTokens;
        this.totalUsage.totalTokens += response.usage.totalTokens;
      }

      // Append and yield assistant message
      this.contextStore.appendMessage(assistantMsg);
      yield assistantMsg;

      // 3. Check for tool calls
      if (response.finishReason === 'tool-calls') {
        const toolCalls = assistantMsg.content.filter(
          (p): p is ToolCallPart => p.type === 'tool-call',
        );

        if (toolCalls.length === 0) break;

        // Execute each tool call
        const toolResults: ToolResultPart[] = [];
        for (const toolCall of toolCalls) {
          // Check permission
          const allowed = await this.permissionManager.checkPermission(
            toolCall.toolName,
            toolCall.input,
          );

          if (!allowed) {
            toolResults.push({
              type: 'tool-result',
              toolCallId: toolCall.toolCallId,
              toolName: toolCall.toolName,
              output: 'Permission denied',
              isError: true,
            });
            continue;
          }

          const result = await this.toolRegistry.execute(
            toolCall.toolName,
            toolCall.toolCallId,
            toolCall.input,
          );

          toolResults.push({
            type: 'tool-result',
            toolCallId: result.toolCallId,
            toolName: result.toolName,
            output: result.output,
            isError: result.isError,
          });
        }

        // Create and append tool result message
        const toolMsg = this.createMessage('tool', toolResults, {
          toolDuration: toolResults.reduce((sum, _r, i) => sum, 0),
        });
        this.contextStore.appendMessage(toolMsg);
        yield toolMsg;

        // Save checkpoint after tool execution
        await this.saveCheckpoint();

        // Check auto-compact
        await this.maybeAutoCompact();

        // Continue loop for next model response
        continue;
      }

      // No tool calls — conversation turn complete
      break;
    }

    // Final checkpoint
    await this.saveCheckpoint();
  }

  private async maybeAutoCompact(): Promise<void> {
    const messages = this.contextStore.getMessages();
    const tokenCount = await this.contextStore.estimateTokenCount();

    // Use a default capability for auto-compact check
    const capabilities = {
      maxInputTokens: 128000,
      maxOutputTokens: 8192,
      supportsVision: true,
      supportsToolCalling: true,
      supportsStreaming: true,
      supportsSystemMessage: true,
      supportsPromptCaching: false,
    };

    if (shouldAutoCompact(messages, tokenCount, capabilities)) {
      const result = await this.compressor.compact(messages, { trigger: 'auto' });
      // Insert compact boundary and summary
      if (result.messages.length > 0) {
        for (const msg of result.messages) {
          this.contextStore.appendMessage(msg);
        }
      }
    }
  }

  private async saveCheckpoint(): Promise<void> {
    try {
      const messages = this.contextStore.getMessages();
      const lastMsg = messages[messages.length - 1];
      const checkpoint: Checkpoint = {
        checkpointId: crypto.randomUUID(),
        sessionId: 'default',
        timestamp: new Date().toISOString(),
        version: 1,
        messagesRef: '',
        lastMessageUuid: lastMsg?.uuid ?? '',
        modelId: this.config.modelId,
        currentStepIndex: messages.length,
        toolExecutionState: { currentTool: null, pendingResults: [] },
        totalUsage: { ...this.totalUsage },
        cwd: process.cwd(),
        fileHistory: [],
        todos: [],
        envSnapshot: {},
      };
      await this.checkpointManager.save(checkpoint);
    } catch {
      // Checkpoint failure is non-fatal
    }
  }

  private createMessage(
    role: 'user' | 'assistant' | 'tool',
    content: ContentPart[],
    extraMetadata?: Record<string, unknown>,
  ): UnifiedMessage {
    const messages = this.contextStore.getMessages();
    const lastMsg = messages[messages.length - 1];
    return {
      uuid: crypto.randomUUID(),
      parentUuid: lastMsg?.uuid ?? null,
      role,
      content,
      timestamp: new Date().toISOString(),
      metadata: {
        modelId: this.config.modelId,
        ...extraMetadata,
      },
    };
  }
}
