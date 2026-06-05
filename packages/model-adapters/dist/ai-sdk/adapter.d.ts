import type { LanguageModel } from 'ai';
import type { AdapterMessage, GenerationRequest, GenerationResult, ModelAdapter, StreamEvent } from '../types/index.js';
import { AiSdkMessageTranslator } from './converter.js';
export type AiSdkGenerationMode = 'stream' | 'nonstream';
export interface AiSdkAdapterOptions {
    generationMode?: AiSdkGenerationMode;
}
export declare class AiSdkAdapter implements ModelAdapter {
    readonly provider: string;
    readonly translator: AiSdkMessageTranslator;
    private model;
    private readonly generationMode;
    constructor(model: LanguageModel, provider: string, options?: AiSdkAdapterOptions);
    generate(request: GenerationRequest): Promise<GenerationResult>;
    stream(request: GenerationRequest): AsyncIterable<StreamEvent>;
    estimateInputTokens(messages: AdapterMessage[]): Promise<number>;
    private mapFinishReason;
    private generateFromStream;
    private generateFromNonStreaming;
    private toGenerationResult;
}
//# sourceMappingURL=adapter.d.ts.map