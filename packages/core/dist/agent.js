import * as crypto from 'crypto';
import { QueryEngine } from './query-engine.js';
import { shouldAutoCompact } from './compressor/index.js';
import { ToolRegistry } from './tool-registry.js';
import { PermissionManager } from './permission.js';
/** Agent �?orchestrates the main conversation loop */
export class Agent {
    queryEngine;
    config;
    contextStore;
    toolRegistry;
    compressor;
    checkpointManager;
    permissionManager;
    totalUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    constructor(queryEngine, config, deps) {
        this.queryEngine = queryEngine;
        this.config = config;
        this.contextStore = deps.contextStore;
        this.toolRegistry = deps.toolRegistry;
        this.compressor = deps.compressor;
        this.checkpointManager = deps.checkpointManager;
        this.permissionManager = deps.permissionManager;
    }
    async *run(userMessage) {
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
            assistantMsg.metadata.tokenUsage = response.usage;
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
                const toolCalls = assistantMsg.content.filter((p) => p.type === 'tool-call');
                if (toolCalls.length === 0)
                    break;
                // Execute each tool call
                const toolResults = [];
                for (const toolCall of toolCalls) {
                    // Check permission
                    const allowed = await this.permissionManager.checkPermission(toolCall.toolName, toolCall.input);
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
                    const result = await this.toolRegistry.execute(toolCall.toolName, toolCall.toolCallId, toolCall.input);
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
            // No tool calls �?conversation turn complete
            break;
        }
        // Final checkpoint
        await this.saveCheckpoint();
    }
    async maybeAutoCompact() {
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
    async saveCheckpoint() {
        try {
            const messages = this.contextStore.getMessages();
            const lastMsg = messages[messages.length - 1];
            const checkpoint = {
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
        }
        catch {
            // Checkpoint failure is non-fatal
        }
    }
    createMessage(role, content, extraMetadata) {
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
//# sourceMappingURL=agent.js.map