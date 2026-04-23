export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  requiresApproval?: boolean;
}

export interface ToolResult {
  toolCallId: string;
  toolName: string;
  output: unknown;
  isError?: boolean;
  duration?: number;
}
