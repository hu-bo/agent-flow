export interface ToolSchema {
  type?: string;
  properties?: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
  [key: string]: unknown;
}

export interface ToolSpec {
  name: string;
  description: string;
  inputSchema: ToolSchema;
  strict?: boolean;
}

export type ToolChoice = 'auto' | 'none' | 'required' | { type: 'tool'; name: string };
