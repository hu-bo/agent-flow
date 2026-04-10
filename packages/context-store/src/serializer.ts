import type { SerializedMessage } from '@agent-flow/model-contracts';

/** JSONL serializer for message persistence */
export class JsonlSerializer {
  serialize(message: SerializedMessage): string {
    return JSON.stringify(message);
  }

  deserialize(line: string): SerializedMessage {
    return JSON.parse(line);
  }

  serializeMany(messages: SerializedMessage[]): string {
    return messages.map(m => this.serialize(m)).join('\n') + '\n';
  }

  deserializeMany(content: string): SerializedMessage[] {
    return content
      .split('\n')
      .filter(line => line.trim())
      .map(line => this.deserialize(line));
  }
}
