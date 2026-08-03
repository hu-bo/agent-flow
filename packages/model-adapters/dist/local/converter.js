import { randomUUID } from 'node:crypto';
export class LocalMessageTranslator {
    toProviderMessages(messages) {
        return messages.map((message) => ({
            id: message.id,
            role: message.role,
            parts: message.parts,
            createdAt: message.createdAt,
        }));
    }
    fromProviderResponse(response, parentId) {
        const parsed = response;
        const parts = [];
        if (parsed.toolCall) {
            parts.push({
                type: 'tool-call',
                callId: parsed.toolCall.id,
                toolName: parsed.toolCall.name,
                args: parsed.toolCall.input,
            });
        }
        if (parsed.text) {
            parts.push({
                type: 'text',
                text: parsed.text,
            });
        }
        return {
            id: randomUUID(),
            parentId,
            role: 'assistant',
            parts,
            createdAt: new Date().toISOString(),
            meta: {},
        };
    }
}
