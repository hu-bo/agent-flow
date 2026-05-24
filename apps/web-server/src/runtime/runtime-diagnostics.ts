import type { UnifiedMessage } from '@agent-flow/core/messages';

export function isRuntimeDiagnosticMessage(message: UnifiedMessage): boolean {
  if (message.metadata.provider !== 'core-runtime') {
    return false;
  }
  const text = message.content
    .filter((part): part is Extract<UnifiedMessage['content'][number], { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join('\n');
  return isRuntimeDiagnosticText(text);
}

export function isRuntimeDiagnosticText(text: string): boolean {
  return (
    text.includes('Core runtime executed successfully.') ||
    text.includes('Core runtime finished with status:') ||
    text.includes('No runner command was requested in this turn.') ||
    text.includes('Latest output:') ||
    text.includes('"mode": "placeholder"')
  );
}
