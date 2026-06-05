import { randomUUID } from 'node:crypto';
import { jsonSchema } from 'ai';
export class AiSdkMessageTranslator {
    toProviderMessages(messages) {
        const result = [];
        for (const msg of messages) {
            if (msg.role === 'system' || msg.role === 'developer')
                continue;
            if (msg.role === 'assistant') {
                result.push({
                    role: 'assistant',
                    content: msg.parts.map((part) => this.convertAssistantPart(part)),
                });
            }
            else if (msg.role === 'user') {
                result.push({
                    role: 'user',
                    content: msg.parts.map((part) => this.convertUserPart(part)),
                });
            }
            else if (msg.role === 'tool') {
                result.push({
                    role: 'tool',
                    content: msg.parts
                        .filter((part) => part.type === 'tool-result')
                        .map((part) => ({
                        type: 'tool-result',
                        toolCallId: part.callId,
                        toolName: part.toolName,
                        result: part.result,
                        isError: part.isError,
                    })),
                });
            }
        }
        return result;
    }
    fromProviderResponse(response, parentId) {
        const res = response;
        const parts = [];
        if (res.text) {
            parts.push({ type: 'text', text: res.text });
        }
        if (res.toolCalls) {
            for (const tc of res.toolCalls) {
                parts.push({
                    type: 'tool-call',
                    callId: tc.toolCallId,
                    toolName: tc.toolName,
                    args: tc.args,
                });
            }
        }
        return {
            id: randomUUID(),
            parentId,
            role: 'assistant',
            parts,
            createdAt: new Date().toISOString(),
            meta: {
                usage: res.usage
                    ? {
                        inputTokens: res.usage.promptTokens,
                        outputTokens: res.usage.completionTokens,
                        totalTokens: res.usage.totalTokens,
                    }
                    : undefined,
            },
        };
    }
    convertToolChoice(toolChoice) {
        if (!toolChoice)
            return undefined;
        if (typeof toolChoice === 'string')
            return toolChoice;
        return { type: 'tool', toolName: toolChoice.name };
    }
    convertTools(tools) {
        if (!tools || tools.length === 0)
            return undefined;
        const result = {};
        for (const tool of tools) {
            result[tool.name] = {
                description: tool.description,
                parameters: jsonSchema(tool.inputSchema),
            };
        }
        return result;
    }
    convertAssistantPart(part) {
        switch (part.type) {
            case 'text':
                return { type: 'text', text: part.text };
            case 'tool-call':
                return {
                    type: 'tool-call',
                    toolCallId: part.callId,
                    toolName: part.toolName,
                    args: part.args,
                };
            default:
                return { type: 'text', text: '' };
        }
    }
    convertUserPart(part) {
        switch (part.type) {
            case 'text':
                return { type: 'text', text: part.text };
            case 'image':
                if (part.source.kind === 'base64') {
                    return {
                        type: 'image',
                        image: part.source.data,
                        mimeType: part.source.mediaType,
                    };
                }
                return {
                    type: 'image',
                    image: new URL(part.source.url),
                };
            default:
                return { type: 'text', text: '' };
        }
    }
}
//# sourceMappingURL=converter.js.map