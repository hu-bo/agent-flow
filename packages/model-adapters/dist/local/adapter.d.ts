import type { AdapterMessage, GenerationRequest, GenerationResult, MessageTranslator, ModelAdapter, StreamEvent } from '../types/index.js';
export interface LocalAdapterOptions {
    providerId?: string;
    assistantName?: string;
}
export declare class LocalAdapter implements ModelAdapter {
    readonly provider: string;
    readonly translator: MessageTranslator;
    private readonly assistantName;
    constructor(options?: LocalAdapterOptions);
    generate(request: GenerationRequest): Promise<GenerationResult>;
    stream(request: GenerationRequest): AsyncIterable<StreamEvent>;
    estimateInputTokens(messages: AdapterMessage[]): Promise<number>;
}
//# sourceMappingURL=adapter.d.ts.map