/** Core context store �?manages message history for a session */
export class ContextStore {
    messages = [];
    getMessages() {
        return this.messages;
    }
    getMessagesAfterCompactBoundary() {
        const boundaryIndex = this.findLastCompactBoundaryIndex();
        return boundaryIndex >= 0 ? this.messages.slice(boundaryIndex) : this.messages;
    }
    appendMessage(message) {
        this.messages.push(message);
    }
    appendMessages(messages) {
        this.messages.push(...messages);
    }
    insertCompactBoundary(boundary, summary) {
        this.messages.push(boundary, summary);
    }
    stripImageContent() {
        for (const message of this.messages) {
            for (let i = 0; i < message.content.length; i++) {
                if (message.content[i].type === 'image') {
                    message.content[i] = { type: 'text', text: '[image removed]' };
                }
            }
        }
    }
    async estimateTokenCount() {
        let total = 0;
        for (const message of this.messages) {
            for (const part of message.content) {
                switch (part.type) {
                    case 'text':
                        total += part.text.length / 4;
                        break;
                    case 'tool-call':
                        total += JSON.stringify(part.input).length / 4;
                        break;
                    case 'tool-result':
                        total += JSON.stringify(part.output).length / 4;
                        break;
                    case 'image':
                        total += 1000;
                        break;
                    case 'file':
                        total += part.data.length / 4;
                        break;
                }
            }
        }
        return Math.ceil(total);
    }
    findLastCompactBoundaryIndex() {
        for (let i = this.messages.length - 1; i >= 0; i--) {
            if (this.messages[i].metadata.compactBoundary)
                return i;
        }
        return -1;
    }
}
//# sourceMappingURL=store.js.map