import type { AdapterMessage, AdapterTokenUsage } from './message.js';

export type FinishReason = 'stop' | 'length' | 'tool-call' | 'content-filter' | 'error';

export interface GenerationResult {
  message: AdapterMessage;
  finishReason: FinishReason;
  usage: AdapterTokenUsage;
  providerResponse?: Record<string, unknown>;
}

export type StreamEvent =
  | {
      type: 'text-delta';
      delta: string;
    }
  | {
      type: 'reasoning-delta';
      delta: string;
    }
  | {
      type: 'tool-call-start';
      callId: string;
      toolName: string;
    }
  | {
      type: 'tool-call-delta';
      callId: string;
      toolName: string;
      delta: string;
    }
  | {
      type: 'tool-call-end';
      callId: string;
      toolName: string;
      args: unknown;
    }
  | {
      type: 'finish';
      finishReason: FinishReason;
      usage: AdapterTokenUsage;
    }
  | {
      type: 'error';
      message: string;
    };
