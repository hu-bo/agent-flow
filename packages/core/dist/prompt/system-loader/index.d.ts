import type { PromptLayer, PromptSystemLoader } from '../../types/index.js';
export declare class LayeredPromptSystemLoader implements PromptSystemLoader {
    load(layers: PromptLayer[]): Promise<string>;
}
//# sourceMappingURL=index.d.ts.map