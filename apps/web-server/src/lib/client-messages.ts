import type { UnifiedMessage } from '@agent-flow/core/messages';
import type { SessionState } from '../contracts/api.js';

export function toClientMessage(message: UnifiedMessage): UnifiedMessage {
  const metadata = message.metadata ?? {};
  const nextMetadata: UnifiedMessage['metadata'] = {};
  if (metadata.modelId !== undefined) nextMetadata.modelId = metadata.modelId;
  if (metadata.turnId !== undefined) nextMetadata.turnId = metadata.turnId;
  if (metadata.model !== undefined) nextMetadata.model = metadata.model;
  if (metadata.provider !== undefined) nextMetadata.provider = metadata.provider;
  if (metadata.isMeta !== undefined) nextMetadata.isMeta = metadata.isMeta;
  if (metadata.toolDuration !== undefined) nextMetadata.toolDuration = metadata.toolDuration;
  if (metadata.compactBoundary !== undefined) nextMetadata.compactBoundary = metadata.compactBoundary;

  if (message.type !== 'tool_execution') {
    return { ...message, metadata: nextMetadata };
  }

  const { output: _output, error: _error, ...tool } = message.tool;
  return {
    ...message,
    metadata: nextMetadata,
    tool,
  };
}

export function toClientSessionState(state: SessionState): SessionState {
  return {
    ...state,
    messages: state.messages.map(toClientMessage),
  };
}

export function toClientMessages(messages: UnifiedMessage[]): UnifiedMessage[] {
  return messages.map(toClientMessage);
}
