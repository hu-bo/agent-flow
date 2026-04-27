import type { PromptVariableRenderer } from '../../types/index.js';

const VARIABLE_PATTERN = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

export class BracesVariableRenderer implements PromptVariableRenderer {
  render(template: string, variables: Record<string, string>): string {
    return template.replace(VARIABLE_PATTERN, (_, key: string) => variables[key] ?? '');
  }
}
