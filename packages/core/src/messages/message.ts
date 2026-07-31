export interface TextPart {
  type: 'text';
  text: string;
}

export type ImageSource =
  | {
      type: 'base64';
      mediaType: string;
      data: string;
    }
  | {
      type: 'url';
      url: string;
    };

export interface ImagePart {
  type: 'image';
  source: ImageSource;
}

export type ThinkingStatus = 'pending' | 'running' | 'success' | 'error';
export type MessageStatus = ThinkingStatus | 'blocked';

export interface ThoughtChainItemPart {
  key: string;
  title?: string;
  description?: string;
  content?: string;
  footer?: string;
  status?: ThinkingStatus;
  durationMs?: number;
  collapsible?: boolean;
}

export interface ThinkingPart {
  type: 'thinking';
  text: string;
  title?: string;
  description?: string;
  footer?: string;
  status?: ThinkingStatus;
  durationMs?: number;
  defaultOpen?: boolean;
  defaultExpandedKeys?: string[];
  items?: ThoughtChainItemPart[];
}

export interface RunnerFilesChangedLine {
  type: 'context' | 'add' | 'del';
  text: string;
  oldLine: number | null;
  newLine: number | null;
}

export interface RunnerFilesChangedHunk {
  header: string;
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: RunnerFilesChangedLine[];
}

export interface RunnerFilesChangedFile {
  path: string;
  additions: number;
  deletions: number;
  diffPreview: {
    contextLines: number;
    hunks: RunnerFilesChangedHunk[];
  } | null;
  truncated: boolean;
  unavailableReason?: string;
}

export interface RunnerFilesChangedPayload {
  type: 'runner-files-changed';
  version: 1;
  source: 'runner-host';
  summary: {
    filesChanged: number;
    additions: number;
    deletions: number;
    truncated: boolean;
  };
  files: RunnerFilesChangedFile[];
  rawOutput: unknown;
}

export interface FilePart {
  type: 'file';
  mimeType: string;
  data: string;
}

export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
}

export interface CompactBoundaryInfo {
  trigger: 'auto' | 'manual' | 'model-switch';
  preCompactTokenCount: number;
  postCompactTokenCount: number;
  summarizedMessageCount: number;
  lastPreCompactMessageUuid: string;
}

export interface MessageMetadata {
  modelId?: string | number;
  model?: string;
  provider?: string;
  tokenUsage?: TokenUsage;
  isMeta?: boolean;
  compactBoundary?: CompactBoundaryInfo;
  toolDuration?: number;
  extensions?: Record<string, unknown>;
}

export interface BaseMessage {
  uuid: string;
  parentUuid: string | null;
  role: MessageRole;
  type: 'text' | 'thinking' | 'image' | 'tool_execution';
  timestamp: string;
  updatedAt?: string;
  metadata: MessageMetadata;
}

export interface TextMessage extends BaseMessage {
  type: 'text';
  role: MessageRole;
  text: string;
  attachments?: FilePart[];
}

export interface ThinkingMessage extends BaseMessage, Omit<ThinkingPart, 'type'> {
  type: 'thinking';
  role: 'assistant';
}

export interface ImageMessage extends BaseMessage {
  type: 'image';
  role: MessageRole;
  source: ImageSource;
  text?: string;
}

export interface ToolExecution {
  callId: string;
  name: string;
  input?: unknown;
  output?: unknown;
  error?: string | null;
}

export interface ToolExecutionMessage extends BaseMessage {
  type: 'tool_execution';
  role: 'tool';
  status: MessageStatus;
  title?: string;
  stepId?: string;
  durationMs?: number;
  tool: ToolExecution;
}

export type UnifiedMessage = TextMessage | ThinkingMessage | ImageMessage | ToolExecutionMessage;

export type SerializedMessage = UnifiedMessage & {
  sessionId: string;
  cwd: string;
  version: string;
  gitBranch?: string;
};
