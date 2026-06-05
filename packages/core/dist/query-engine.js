/** QueryEngine �?manages message assembly and model invocation */
export class QueryEngine {
    gateway;
    contextStore;
    compressor;
    config;
    constructor(gateway, contextStore, compressor, config = {}) {
        this.gateway = gateway;
        this.contextStore = contextStore;
        this.compressor = compressor;
        this.config = config;
    }
    /** Send messages to model and get response */
    async query(tools) {
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
    async *streamQuery(tools) {
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
    async switchModel(newModelId) {
        this.gateway.switchModel(newModelId);
    }
    /** Update system prompt */
    setSystemPrompt(prompt) {
        this.config.systemPrompt = prompt;
    }
}
//# sourceMappingURL=query-engine.js.map