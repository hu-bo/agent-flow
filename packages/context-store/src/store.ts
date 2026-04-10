import type { UnifiedMessage } from '@agent-flow/model-contracts';

/** Core context store — manages message history for a session */
export class ContextStore {
  private messages: UnifiedMessage[] = [];

  getMessages(): UnifiedMessage[] {
    return this.messages;
  }

  getMessagesAfterCompactBoundary(): UnifiedMessage[] {
    const boundaryIndex = this.findLastCompactBoundaryIndex();
    return boundaryIndex >= 0 ? this.messages.slice(boundaryIndex) : this.messages;
  }

  appendMessage(message: UnifiedMessage): void {
    this.messages.push(message);
  }

  appendMessages(messages: UnifiedMessage[]): void {
    this.messages.push(...messages);
  }

  insertCompactBoundary(boundary: UnifiedMessage, summary: UnifiedMessage): void {
    this.messages.push(boundary, summary);
  }

  stripImageContent(): void {
    for (const message of this.messages) {
      for (let i = 0; i < message.content.length; i++) {
        if (message.content[i].type === 'image') {
          message.content[i] = { type: 'text', text: '[image removed]' };
        }
      }
    }
  }

  async estimateTokenCount(): Promise<number> {
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

  private findLastCompactBoundaryIndex(): number {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].metadata.compactBoundary) return i;
    }
    return -1;
  }
}
