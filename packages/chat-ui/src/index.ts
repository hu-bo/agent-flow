import './v2.css';
import 'highlight.js/styles/github.css';

export { ChatPanel } from './components/ChatPanel/ChatPanel';
export type { ChatPanelActions, ChatPanelProps } from './components/ChatPanel/ChatPanel';
export type { ComposerConfig } from './components/Composer/Composer';
export { ActionPrompt } from './components/ActionPrompt/ActionPrompt';
export type {
  ActionPromptCustomInput,
  ActionPromptOption,
  ActionPromptProps,
  ActionPromptSubmitPayload,
  ActionPromptToggle,
} from './components/ActionPrompt/ActionPrompt';
export type {
  ChatMessage,
  ChatOption,
  ChatSuggestion,
  FileAttachment,
  FilePart,
  ImageMessage,
  ImagePart,
  ImageSource,
  MessageMetadata,
  MessageRole,
  MessageStatus,
  ReasoningEffort,
  TextMessage,
  TextPart,
  TokenUsage,
  TokenUsageSummary,
  ToolExecution,
  ToolExecutionMessage,
  UnifiedMessage,
} from './types';
