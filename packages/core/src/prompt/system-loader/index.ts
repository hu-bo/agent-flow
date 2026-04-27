import type { PromptLayer, PromptSystemLoader } from '../../types/index.js';

export class LayeredPromptSystemLoader implements PromptSystemLoader {
  async load(layers: PromptLayer[]): Promise<string> {
    return layers
      .map((layer) => layer.content.trim())
      .filter((content) => content.length > 0)
      .join('\n\n');
  }
}
