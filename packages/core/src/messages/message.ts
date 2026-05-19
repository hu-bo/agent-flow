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

export interface ToolCallPart {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  input: unknown;
}

export interface ToolResultPart {
  type: 'tool-result';
  toolCallId: string;
  toolName: string;
  output: unknown;
  isError?: boolean;
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

export type ContentPart = TextPart | ImagePart | ToolCallPart | ToolResultPart | FilePart;

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

export interface UnifiedMessage {
  uuid: string;
  parentUuid: string | null;
  role: MessageRole;
  content: ContentPart[];
  timestamp: string;
  metadata: MessageMetadata;
}

export interface SerializedMessage extends UnifiedMessage {
  sessionId: string;
  cwd: string;
  version: string;
  gitBranch?: string;
}
