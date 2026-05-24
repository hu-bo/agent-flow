import type { FilePart, UnifiedMessage } from '@agent-flow/core/messages';
import { NotFoundError, ValidationError } from '../../lib/errors.js';

export interface RetryRequestParts {
  retryUserIndex: number;
  retryText: string;
  retryAttachments: FilePart[];
}

export class RetryPolicy {
  resolveRetryRequest(messages: UnifiedMessage[], messageId: string): RetryRequestParts {
    const targetIndex = messages.findIndex((message) => message.uuid === messageId);
    if (targetIndex < 0) {
      throw new NotFoundError(`Message not found: ${messageId}`);
    }

    const retryUserIndex = this.resolveRetryUserIndex(messages, targetIndex);
    if (retryUserIndex < 0) {
      throw new ValidationError('Retry target does not have a corresponding user message');
    }

    const userMessage = messages[retryUserIndex];
    if (!userMessage) {
      throw new ValidationError('Retry target does not have a corresponding user message');
    }

    return {
      retryUserIndex,
      retryText: this.extractRetryText(userMessage),
      retryAttachments: userMessage.content.filter((part): part is FilePart => part.type === 'file'),
    };
  }

  private resolveRetryUserIndex(messages: UnifiedMessage[], targetIndex: number): number {
    for (let index = targetIndex; index >= 0; index -= 1) {
      if (messages[index]?.role === 'user') {
        return index;
      }
    }
    return -1;
  }

  private extractRetryText(message: UnifiedMessage): string {
    const textPart = message.content.find(
      (part): part is { type: 'text'; text: string } => part.type === 'text',
    );
    const text = textPart?.text?.trim();
    if (!text) {
      throw new ValidationError('The selected message does not contain retryable text');
    }
    return text;
  }
}
