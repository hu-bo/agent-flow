import type { AdapterMessage } from './message.js';
import type { ToolChoice, ToolSpec } from './tool.js';

export interface GenerationConfig {
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface GenerationRequest {
  model: string;
  messages: AdapterMessage[];
  systemPrompt?: string;
  tools?: ToolSpec[];
  toolChoice?: ToolChoice;
  config?: GenerationConfig;
  metadata?: Record<string, unknown>;
  signal?: AbortSignal;
}
