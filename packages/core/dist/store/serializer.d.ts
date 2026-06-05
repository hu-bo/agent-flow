import type { SerializedMessage } from '../messages/index.js';
/** JSONL serializer for message persistence */
export declare class JsonlSerializer {
    serialize(message: SerializedMessage): string;
    deserialize(line: string): SerializedMessage;
    serializeMany(messages: SerializedMessage[]): string;
    deserializeMany(content: string): SerializedMessage[];
}
//# sourceMappingURL=serializer.d.ts.map