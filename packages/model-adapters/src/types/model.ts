export interface ModelCapabilities {
  inputTokenLimit: number;
  outputTokenLimit: number;
  supportsStreaming: boolean;
  supportsTools: boolean;
  supportsVision: boolean;
  supportsSystemPrompt: boolean;
  supportsReasoning: boolean;
}

export interface ModelDescriptor {
  id: string;
  provider: string;
  displayName: string;
  capabilities: ModelCapabilities;
  metadata?: Record<string, unknown>;
}

export interface ModelCatalog {
  register(model: ModelDescriptor): void;
  get(modelId: string): ModelDescriptor | undefined;
  listByProvider(provider: string): ModelDescriptor[];
  listAll(): ModelDescriptor[];
}
