import './styles.css';
import 'highlight.js/styles/github.css';

// Components
export { ChatPanel } from './components/ChatPanel';
export type { ChatPanelProps } from './components/ChatPanel';
export { MessageList } from './components/MessageList';
export { MessageBubble } from './components/MessageBubble';
export { InputArea } from './components/InputArea';

// Registry
export { ContentRendererRegistry, createDefaultRegistry } from './registry';
export type { ContentRenderer, ContentRendererProps } from './registry';

// Renderers (for custom composition)
export { TextRenderer } from './renderers/TextRenderer';
export { ThinkingRenderer } from './renderers/ThinkingRenderer';
export { ImageRenderer } from './renderers/ImageRenderer';
export { CodeDiffRenderer } from './renderers/CodeDiffRenderer';
export { ToolCallRenderer } from './renderers/ToolCallRenderer';
export { ToolResultRenderer } from './renderers/ToolResultRenderer';
export { FileAttachmentRenderer } from './renderers/FileAttachmentRenderer';

// Types
export type {
  ChatContentPart,
  ChatMessage,
  FileAttachment,
  ThinkingPart,
  CodeDiffPart,
  // Re-exports from model-contracts
  ContentPart,
  TextPart,
  ImagePart,
  ImageSource,
  ToolCallPart,
  ToolResultPart,
  FilePart,
  MessageRole,
  UnifiedMessage,
  MessageMetadata,
  TokenUsage,
} from './types';
