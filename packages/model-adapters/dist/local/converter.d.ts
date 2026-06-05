import type { AdapterMessage, MessageTranslator } from '../types/index.js';
export declare class LocalMessageTranslator implements MessageTranslator {
    toProviderMessages(messages: AdapterMessage[]): unknown[];
    fromProviderResponse(response: unknown, parentId: string | null): AdapterMessage;
}
//# sourceMappingURL=converter.d.ts.map