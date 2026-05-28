import type { RuntimeChatInput } from '../contracts/api.js';
import type { RunnerDirective, RuntimeMode } from './runtime-types.js';

const CASUAL_CHAT_PATTERNS = [
  /^(hi|hello|hey|thanks|thank you|ok|okay|yes|no|who are you|what can you do)[.!? ]*$/i,
  /^(?:\u4f60\u597d|\u60a8\u597d|\u55e8|\u8c22\u8c22|\u8c22\u8c22\u4f60|\u597d\u7684|\u53ef\u4ee5|\u662f\u8c01|\u4f60\u662f\u8c01|\u4f60\u80fd\u505a\u4ec0\u4e48|\u4f60\u53ef\u4ee5\u505a\u4ec0\u4e48)[\u3002\uff01\uff1f?\s]*$/,
];

export function parseRunnerDirective(message: string): RunnerDirective | undefined {
  const trimmed = message.trim();
  if (!trimmed.toLowerCase().startsWith('/run ')) {
    return undefined;
  }

  const commandLine = trimmed.slice(5).trim();
  if (!commandLine) {
    return undefined;
  }

  const tokens = tokenizeCommandLine(commandLine);
  if (tokens.length === 0) {
    return undefined;
  }

  return {
    command: tokens[0]!,
    args: tokens.slice(1),
  };
}

export function resolveRuntimeMode(input: RuntimeChatInput, runnerDirective: RunnerDirective | undefined): RuntimeMode {
  if (runnerDirective) {
    return 'runner';
  }

  if (input.session.mode === 'spec') {
    return 'autonomous';
  }

  const message = input.message.trim();
  if (isCasualChat(message)) {
    return 'chat';
  }

  return 'autonomous';
}

export function isCasualChat(message: string): boolean {
  return CASUAL_CHAT_PATTERNS.some((pattern) => pattern.test(message.trim()));
}

function tokenizeCommandLine(commandLine: string): string[] {
  const tokens = commandLine.match(/"[^"]*"|'[^']*'|\S+/g) ?? [];
  return tokens
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => {
      if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
        return token.slice(1, -1);
      }
      return token;
    });
}