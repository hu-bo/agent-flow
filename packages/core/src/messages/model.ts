export interface ModelCapabilities {
  maxInputTokens: number;
  maxOutputTokens: number;
  supportsVision: boolean;
  supportsToolCalling: boolean;
  supportsStreaming: boolean;
  supportsSystemMessage: boolean;
  supportsPromptCaching: boolean;
  supportedMediaTypes?: string[];
}

export interface ModelInfo {
  modelId: string;
  displayName: string;
  provider: string;
  capabilities: ModelCapabilities;
}

export interface ModelRegistry {
  register(model: ModelInfo): void;
  get(modelId: string): ModelInfo | undefined;
  getByProvider(provider: string): ModelInfo[];
  listAll(): ModelInfo[];
}
