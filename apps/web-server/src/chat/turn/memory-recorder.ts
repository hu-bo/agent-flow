import type { UnifiedMessage } from '@agent-flow/core/messages';
import type { MemoryService } from '@agent-flow/memory';

export class MemoryRecorder {
  constructor(private readonly memoryService?: MemoryService) {}

  async record(sessionId: string, message: UnifiedMessage): Promise<void> {
    if (!this.memoryService) {
      return;
    }
    if (message.metadata?.isMeta) {
      return;
    }

    const text = this.extractMemoryText(message);
    if (!text) {
      return;
    }

    try {
      await this.memoryService.rememberSession(sessionId, text, {
        role: message.role,
        messageId: message.uuid,
        timestamp: message.timestamp,
      });
    } catch {
      // Memory writes are best-effort; chat must continue if the backend is unavailable.
    }
  }

  private extractMemoryText(message: UnifiedMessage): string {
    return message.content
      .map((part) => {
        if (part.type === 'text') return part.text;
        if (part.type === 'file') return `[file:${part.mimeType}]`;
        if (part.type === 'tool-call') return `[tool-call:${part.toolName}]`;
        if (part.type === 'tool-result') return `[tool-result:${part.toolName}]`;
        if (part.type === 'image') return '[image]';
        return '';
      })
      .filter(Boolean)
      .join(' ')
      .trim();
  }
}
