import type { RuntimeChatInput } from '../contracts/api.js';
import type { RunnerDirective, RuntimeMode } from './runtime-types.js';

const AUTONOMOUS_ACTION_HINTS = [
  'plan',
  'decompose',
  'break down',
  'workflow',
  'execute',
  'run',
  'implement',
  'build',
  'create',
  'add',
  'fix',
  'debug',
  'refactor',
  'update',
  'optimize',
  'verify',
  'validate',
  'test',
  'search',
  'find',
  'read',
  'inspect',
  'analyze',
  'summarize',
  'list',
  'show',
  'open',
];

const AUTONOMOUS_ZH_ACTION_HINTS = [
  '规划',
  '拆解',
  '任务',
  '执行',
  '实现',
  '构建',
  '创建',
  '新增',
  '添加',
  '修复',
  '调试',
  '重构',
  '修改',
  '更新',
  '优化',
  '验证',
  '校验',
  '测试',
  '搜索',
  '查找',
  '读取',
  '查看',
  '看看',
  '分析',
  '总结',
  '列出',
  '打开',
];

const CASUAL_CHAT_PATTERNS = [
  /^(hi|hello|hey|thanks|thank you|ok|okay|yes|no|who are you|what can you do)[.!? ]*$/i,
  /^(你好|您好|嗨|谢谢|好的|可以|是谁|你是谁|你能做什么)[。！？!?\s]*$/,
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

  if (input.attachments.length > 0 || input.session.projectId || input.session.cwd) {
    return 'autonomous';
  }

  if (hasAutonomousActionHint(message)) {
    return 'autonomous';
  }

  return 'chat';
}

export function isCasualChat(message: string): boolean {
  return CASUAL_CHAT_PATTERNS.some((pattern) => pattern.test(message.trim()));
}

export function hasAutonomousActionHint(message: string): boolean {
  const lowered = message.toLowerCase();
  return (
    AUTONOMOUS_ACTION_HINTS.some((hint) => lowered.includes(hint)) ||
    AUTONOMOUS_ZH_ACTION_HINTS.some((hint) => message.includes(hint))
  );
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
