import type { AdapterMessage, MessageTranslator, ToolChoice, ToolSpec } from '../types/index.js';
export declare class AiSdkMessageTranslator implements MessageTranslator {
    toProviderMessages(messages: AdapterMessage[]): unknown[];
    fromProviderResponse(response: unknown, parentId: string | null): AdapterMessage;
    convertToolChoice(toolChoice?: ToolChoice): 'auto' | 'none' | 'required' | {
        type: 'tool';
        toolName: string;
    } | undefined;
    convertTools(tools?: ToolSpec[]): Record<string, unknown> | undefined;
    private convertAssistantPart;
    private convertUserPart;
}
