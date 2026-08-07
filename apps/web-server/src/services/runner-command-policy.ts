const READ_ONLY_SHELL_COMMANDS = new Set([
  'basename',
  'cat',
  'cmd',
  'cut',
  'date',
  'dir',
  'dirname',
  'du',
  'echo',
  'env',
  'find',
  'findstr',
  'git',
  'grep',
  'head',
  'ls',
  'printf',
  'pwd',
  'readlink',
  'realpath',
  'rg',
  'sed',
  'tail',
  'type',
  'wc',
  'where',
  'which',
  'whoami',
  'powershell',
  'powershell.exe',
  'pwsh',
  'pwsh.exe',
  'get-childitem',
  'get-content',
  'select-string',
  'resolve-path',
  'test-path',
]);

const READ_ONLY_SHELL_WRAPPERS = new Set(['bash', 'dash', 'sh', 'zsh']);
const SHELL_REDIRECT_PATTERN = /(?:^|\s)(?:\d?>|\d?>>|&>|<)/;
const SHELL_MUTATION_PATTERN =
  /\s(?:rm|rmdir|del|erase|move|mv|copy|cp|new-item|remove-item|set-content|add-content|out-file|rename-item|move-item|copy-item|mkdir|ni|sc|ac|write-output|tee|git\s+(?:add|commit|push|pull|checkout|switch|reset|merge|rebase|clean|apply)|npm\s+(?:install|i)|pnpm\s+(?:install|i)|yarn\s+(?:install|add)|pip\s+install|go\s+(?:get|install)|curl|wget|invoke-webrequest|iwr|format|shutdown|reboot)\b/;

export function isReadOnlyShellExec(input: Record<string, unknown> | undefined): boolean {
  const command = readShellCommand(input);
  if (!command) return false;

  const executable = normalizeExecutable(command);
  const line = normalizeCommandLine(command, input);
  if (READ_ONLY_SHELL_COMMANDS.has(executable)) return isReadOnlyShellScript(line);
  if (!READ_ONLY_SHELL_WRAPPERS.has(executable)) return false;

  const script = extractShellWrapperScript(input);
  return script !== undefined && isReadOnlyShellScript(script);
}

function readShellCommand(input: Record<string, unknown> | undefined): string | undefined {
  const command = input?.command;
  if (typeof command === 'string' && command.trim().length > 0) return command.trim();
  const firstArg = Array.isArray(input?.args) ? input.args[0] : undefined;
  return typeof firstArg === 'string' && firstArg.trim().length > 0 ? firstArg.trim() : undefined;
}

function normalizeExecutable(command: string): string {
  const trimmed = command.trim();
  const match = trimmed.match(/^"([^"]+)"|^'([^']+)'|^(\S+)/);
  const firstToken = match?.[1] ?? match?.[2] ?? match?.[3] ?? trimmed;
  return firstToken.replace(/\\/g, '/').split('/').pop()?.toLowerCase() ?? firstToken.toLowerCase();
}

function normalizeCommandLine(command: string, input: Record<string, unknown> | undefined): string {
  const args = Array.isArray(input?.args) ? input.args.map((value) => String(value)) : [];
  return ` ${[command, ...args].join(' ').toLowerCase()} `;
}

function extractShellWrapperScript(input: Record<string, unknown> | undefined): string | undefined {
  const args = Array.isArray(input?.args) ? input.args.map((value) => String(value)) : [];
  const commandIndex = args.findIndex((arg) => arg === '-c' || arg === '-lc' || arg === '-cl');
  if (commandIndex < 0) return undefined;
  const script = args[commandIndex + 1]?.trim();
  return script || undefined;
}

function isReadOnlyShellScript(script: string): boolean {
  const normalized = ` ${script.trim().toLowerCase()} `;
  if (!normalized.trim() || SHELL_MUTATION_PATTERN.test(normalized)) return false;
  if (SHELL_REDIRECT_PATTERN.test(normalized.replaceAll('2>/dev/null', ''))) return false;
  if (normalized.includes('$(') || normalized.includes(String.fromCharCode(96)) || normalized.includes('${')) {
    return false;
  }

  const commands = normalized
    .split(/(?:&&|\|\||\||;)/)
    .map((segment) => segment.trim())
    .filter(Boolean);
  return commands.length > 0 && commands.every((segment) => READ_ONLY_SHELL_COMMANDS.has(normalizeExecutable(segment)));
}
