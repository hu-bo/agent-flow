export type AdapterRole = 'system' | 'developer' | 'user' | 'assistant' | 'tool';

export interface TextPart {
  type: 'text';
  text: string;
}

export interface ImagePart {
  type: 'image';
  source:
    | {
        kind: 'url';
        url: string;
      }
    | {
        kind: 'base64';
        mediaType: string;
        data: string;
      };
}

export interface FilePart {
  type: 'file';
  mediaType: string;
  filename?: string;
  source:
    | {
        kind: 'url';
        url: string;
      }
    | {
        kind: 'base64';
        data: string;
      };
}

export interface ToolCallPart {
  type: 'tool-call';
  callId: string;
  toolName: string;
  args: unknown;
}

export interface ToolResultPart {
  type: 'tool-result';
  callId: string;
  toolName: string;
  result: unknown;
  isError?: boolean;
}

export interface ReasoningPart {
  type: 'reasoning';
  text: string;
}

export type MessagePart = TextPart | ImagePart | FilePart | ToolCallPart | ToolResultPart | ReasoningPart;

export interface AdapterTokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  reasoningTokens?: number;
}

export interface AdapterMessageMeta {
  provider?: string;
  model?: string;
  usage?: AdapterTokenUsage;
  tags?: string[];
  extra?: Record<string, unknown>;
}

export interface AdapterMessage {
  id: string;
  parentId: string | null;
  role: AdapterRole;
  parts: MessagePart[];
  createdAt: string;
  meta?: AdapterMessageMeta;
}
