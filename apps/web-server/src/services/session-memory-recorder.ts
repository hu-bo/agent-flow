import type { UnifiedMessage } from '@agent-flow/core/messages';
import type { MemoryService } from '@agent-flow/memory';
import { getMessageText } from '../lib/messages.js';

export async function recordSessionMessage(
  memoryService: MemoryService | undefined,
  sessionId: string,
  message: UnifiedMessage,
): Promise<void> {
  if (!memoryService || message.metadata?.isMeta) return;
  const text = getMessageText(message).trim();
  if (!text) return;

  try {
    await memoryService.rememberSession(sessionId, text, {
      role: message.role,
      messageId: message.uuid,
      timestamp: message.timestamp,
    });
  } catch {
    // Memory is supplemental and must not make a chat turn fail.
  }
}
