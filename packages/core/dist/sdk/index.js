import { ModelGateway } from '../gateway/index.js';
import { ContextStore, SessionManager } from '../store/index.js';
import { ContextCompressor } from '../compressor/index.js';
import { LocalCheckpointManager } from '../checkpoint/index.js';
import { Agent } from '../agent.js';
import { QueryEngine } from '../query-engine.js';
import { ToolRegistry } from '../tool-registry.js';
import { PermissionManager } from '../permission.js';
export class AgentFlow {
    gateway;
    contextStore;
    sessionManager;
    checkpointManager;
    toolRegistry;
    permissionManager;
    config;
    constructor(config) {
        this.config = config;
        this.gateway = new ModelGateway({ defaultModel: config.defaultModel });
        this.contextStore = new ContextStore();
        this.sessionManager = new SessionManager(config.sessionDir ?? '.agent-flow/sessions');
        this.checkpointManager = new LocalCheckpointManager(config.checkpointDir ?? '.agent-flow/checkpoints');
        this.toolRegistry = new ToolRegistry();
        this.permissionManager = new PermissionManager();
    }
    registerAdapter(modelId, adapter) {
        this.gateway.registerAdapter(modelId, adapter);
    }
    registerTool(definition, executor) {
        this.toolRegistry.register(definition, executor);
    }
    async *chat(message) {
        const adapter = this.gateway.getAdapter();
        const compressor = new ContextCompressor(adapter);
        const queryEngine = new QueryEngine(this.gateway, this.contextStore, compressor, { systemPrompt: this.config.systemPrompt });
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
    async switchModel(modelId) {
        this.gateway.switchModel(modelId);
    }
    async compact() {
        const adapter = this.gateway.getAdapter();
        const compressor = new ContextCompressor(adapter);
        const messages = this.contextStore.getMessages();
        return compressor.compact(messages, { trigger: 'manual' });
    }
    getSession() {
        return {
            messages: this.contextStore.getMessages(),
            model: this.gateway.resolveModel(),
        };
    }
    async resume(sessionId) {
        const session = this.sessionManager.loadSession(sessionId);
        if (session) {
            this.contextStore.appendMessages(session.messages);
        }
    }
    listSessions() {
        return this.sessionManager.listSessions();
    }
    getToolRegistry() {
        return this.toolRegistry;
    }
    getGateway() {
        return this.gateway;
    }
}
//# sourceMappingURL=index.js.map