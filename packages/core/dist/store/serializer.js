/** JSONL serializer for message persistence */
export class JsonlSerializer {
    serialize(message) {
        return JSON.stringify(message);
    }
    deserialize(line) {
        return JSON.parse(line);
    }
    serializeMany(messages) {
        return messages.map(m => this.serialize(m)).join('\n') + '\n';
    }
    deserializeMany(content) {
        return content
            .split('\n')
            .filter(line => line.trim())
            .map(line => this.deserialize(line));
    }
}
//# sourceMappingURL=serializer.js.map