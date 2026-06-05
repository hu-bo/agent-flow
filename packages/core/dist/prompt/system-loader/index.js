export class LayeredPromptSystemLoader {
    async load(layers) {
        return layers
            .map((layer) => layer.content.trim())
            .filter((content) => content.length > 0)
            .join('\n\n');
    }
}
//# sourceMappingURL=index.js.map