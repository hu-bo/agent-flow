export class ModelRouter {
    adapters = new Map();
    modelRegistry = new Map();
    registerAdapter(modelId, adapter) {
        this.adapters.set(modelId, adapter);
    }
    registerModel(model) {
        this.modelRegistry.set(model.modelId, model);
    }
    routeByName(modelId) {
        return this.adapters.get(modelId);
    }
    routeByCapability(requirements) {
        for (const [modelId, info] of this.modelRegistry) {
            const caps = info.capabilities;
            const matches = Object.keys(requirements).every(key => {
                const required = requirements[key];
                if (required === undefined)
                    return true;
                if (typeof required === 'number')
                    return caps[key] >= required;
                return caps[key] === required;
            });
            if (matches)
                return this.adapters.get(modelId);
        }
        return undefined;
    }
    routeByProvider(providerId) {
        return Array.from(this.adapters.values()).filter(a => a.providerId === providerId);
    }
    listModels() {
        return Array.from(this.modelRegistry.values());
    }
}
//# sourceMappingURL=router.js.map