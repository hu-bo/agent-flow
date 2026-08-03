export class ContextBuilder {
    loader;
    selector;
    windowManager;
    maxTokens;
    constructor(loader, selector, windowManager, options) {
        this.loader = loader;
        this.selector = selector;
        this.windowManager = windowManager;
        this.maxTokens = options.maxTokens;
    }
    async build(request) {
        const loaded = await this.loader.load(request);
        const selected = await this.selector.select(loaded, request);
        return this.windowManager.apply(selected, this.maxTokens);
    }
}
