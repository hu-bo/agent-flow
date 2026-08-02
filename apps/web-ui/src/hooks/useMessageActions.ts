import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import type { ChatMessage, ReasoningEffort } from '@agent-flow/chat-ui';
import { deleteSessionMessage, retrySessionMessage } from '../api';
import {
  copyToClipboard,
  readErrorMessage,
  stringifyMessageForCopy,
  type NoticeState,
} from '../pages/chat-page-utils';

interface UseMessageActionsOptions {
  activeSession: string | null;
  selectedModelId: number | null;
  reasoningEffort: ReasoningEffort;
  isConnecting: boolean;
  isStreaming: boolean;
  refreshSessionMessages: (sessionId: string | null) => Promise<void>;
  setNotice: Dispatch<SetStateAction<NoticeState>>;
}

export function useMessageActions({
  activeSession,
  selectedModelId,
  reasoningEffort,
  isConnecting,
  isStreaming,
  refreshSessionMessages,
  setNotice,
}: UseMessageActionsOptions) {
  const [isMutatingMessage, setIsMutatingMessage] = useState(false);
  const isActionLocked = isConnecting || isStreaming || isMutatingMessage;

  const handleRetryMessage = useCallback(
    async (message: ChatMessage) => {
      if (!activeSession) {
        setNotice({ kind: 'error', message: 'Session is not ready for retry.' });
        return;
      }
      if (isActionLocked) {
        return;
      }

      setIsMutatingMessage(true);
      try {
        await retrySessionMessage({
          sessionId: activeSession,
          messageId: message.uuid,
          modelId: selectedModelId ?? undefined,
          reasoningEffort,
        });
        await refreshSessionMessages(activeSession);
      } catch (error: unknown) {
        setNotice({
          kind: 'error',
          message: readErrorMessage(error, 'Failed to retry message'),
        });
      } finally {
        setIsMutatingMessage(false);
      }
    },
    [
      activeSession,
      isActionLocked,
      reasoningEffort,
      refreshSessionMessages,
      selectedModelId,
      setNotice,
    ],
  );

  const handleCopyMessage = useCallback(
    async (message: ChatMessage) => {
      const content = stringifyMessageForCopy(message);
      if (!content) {
        setNotice({ kind: 'error', message: 'Message has no copyable content.' });
        return;
      }
      try {
        await copyToClipboard(content);
        setNotice({ kind: 'success', message: 'Message copied to clipboard.' });
      } catch (error: unknown) {
        setNotice({
          kind: 'error',
          message: readErrorMessage(error, 'Failed to copy message'),
        });
      }
    },
    [setNotice],
  );

  const handleDeleteMessage = useCallback(
    async (message: ChatMessage) => {
      if (!activeSession) {
        setNotice({ kind: 'error', message: 'Session is not ready for delete.' });
        return;
      }
      if (isActionLocked) {
        return;
      }
      const confirmed = window.confirm('Delete this message and following conversation?');
      if (!confirmed) {
        return;
      }

      setIsMutatingMessage(true);
      try {
        await deleteSessionMessage(activeSession, message.uuid);
        await refreshSessionMessages(activeSession);
      } catch (error: unknown) {
        setNotice({
          kind: 'error',
          message: readErrorMessage(error, 'Failed to delete message'),
        });
      } finally {
        setIsMutatingMessage(false);
      }
    },
    [activeSession, isActionLocked, refreshSessionMessages, setNotice],
  );

  return {
    handleRetryMessage,
    handleCopyMessage,
    handleDeleteMessage,
    messageActionsDisabled: isActionLocked,
  };
}
