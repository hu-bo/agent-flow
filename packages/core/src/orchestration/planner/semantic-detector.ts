export interface SemanticToolStep {
  title: string;
  toolName: 'shell.exec';
  input: Record<string, unknown>;
}

type ShellStyle = 'powershell' | 'posix';

const ZH_READ_HINTS = ['\u67e5\u770b', '\u770b\u770b', '\u770b\u4e0b', '\u8bfb\u53d6', '\u6253\u5f00'];
const ZH_SEARCH_HINTS = ['\u641c\u7d22', '\u67e5\u627e'];
const ZH_LIST_HINTS = ['\u5217\u51fa', '\u76ee\u5f55', '\u6587\u4ef6\u5217\u8868', '\u6587\u4ef6\u5939', '\u684c\u9762', '\u6709\u4ec0\u4e48'];
const ZH_RECURSIVE_HINTS = ['\u9012\u5f52', '\u5168\u5c40', '\u5168\u91cf'];
const ZH_FILE_NOUNS = ['\u6587\u4ef6', '\u6587\u4ef6\u5939', '\u76ee\u5f55'];

const EN_LIST_INTENT = /(list|ls|dir|tree)/i;
const EN_READ_INTENT = /(read|open|cat|show)/i;
const EN_SEARCH_INTENT = /(search|find|grep)/i;
const EN_RECURSIVE_HINT = /(recursive|tree)/i;
const SEARCH_MARKERS = ['search ', 'find ', 'grep ', '\u641c\u7d22', '\u67e5\u627e'];

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function includesAny(haystack: string, needles: readonly string[]): boolean {
  return needles.some((needle) => haystack.includes(needle));
}

function isWindowsDriveRootPath(path: string): boolean {
  return /^[A-Za-z]:[\\/]?$/.test(path.trim());
}

function extractWindowsDrivePath(message: string): string | undefined {
  const explicitDrive = message.match(/\b([A-Za-z]):(?:[\\/][^\s"'`]*)?/);
  if (explicitDrive?.[0]) {
    return explicitDrive[0].length === 2 ? `${explicitDrive[0]}\\` : explicitDrive[0];
  }

  const zhDrive = message.match(/\b([A-Za-z])\s*\u76d8/);
  if (zhDrive?.[1]) {
    return `${zhDrive[1].toUpperCase()}:\\`;
  }

  return undefined;
}

export class SemanticFsDetector {
  detect(rawMessage: string, metadata?: Record<string, unknown>): SemanticToolStep | undefined {
    const message = normalizeWhitespace(rawMessage);
    if (!message) {
      return undefined;
    }

    const explicitPath = this.extractExplicitPath(message);
    const candidatePath = this.resolveCandidatePath(message, explicitPath);
    const hasLookVerb = includesAny(message, ZH_READ_HINTS);
    const hasFileNoun = includesAny(message, ZH_FILE_NOUNS);
    const hasListIntent = EN_LIST_INTENT.test(message) || includesAny(message, ZH_LIST_HINTS) || (hasLookVerb && hasFileNoun);

    if (this.shouldRead(message, explicitPath, hasLookVerb, hasListIntent)) {
      return {
        title: 'shell-file-read',
        toolName: 'shell.exec',
        input: buildReadInput(explicitPath, resolveShellStyle(metadata, explicitPath)),
      };
    }

    if (EN_SEARCH_INTENT.test(message) || includesAny(message, ZH_SEARCH_HINTS)) {
      const pattern = this.extractSearchPattern(message);
      if (pattern) {
        return {
          title: 'shell-file-search',
          toolName: 'shell.exec',
          input: buildSearchInput(
            candidatePath || '.',
            pattern,
            /recursive/i.test(message) || includesAny(message, ZH_RECURSIVE_HINTS),
            resolveShellStyle(metadata, candidatePath),
          ),
        };
      }
    }

    if (hasListIntent) {
      return {
        title: 'shell-file-list',
        toolName: 'shell.exec',
        input: buildListInput(
          candidatePath || '.',
          EN_RECURSIVE_HINT.test(message) || includesAny(message, ZH_RECURSIVE_HINTS),
          resolveShellStyle(metadata, candidatePath),
        ),
      };
    }

    return undefined;
  }

  private extractExplicitPath(message: string): string {
    const quotedPath = message.match(/`([^`]+)`/)?.[1];
    const genericPath =
      message.match(/[A-Za-z]:(?:[\\/][^\s"'`]*)?|\.{0,2}[\\/][^\s"'`]+|[A-Za-z0-9._-]+[\\/][^\s"'`]+/)?.[0] ?? '';

    return (quotedPath ?? genericPath).trim();
  }

  private resolveCandidatePath(message: string, explicitPath: string): string {
    if (explicitPath.length > 0) {
      return explicitPath;
    }

    const drivePath = extractWindowsDrivePath(message);
    if (drivePath) {
      return drivePath;
    }

    if (includesAny(message, ['\u684c\u9762', 'Desktop', 'desktop'])) {
      return '.';
    }

    return '';
  }

  private shouldRead(message: string, explicitPath: string, hasLookVerb: boolean, hasListIntent: boolean): boolean {
    if (!explicitPath || hasListIntent) {
      return false;
    }

    if (isWindowsDriveRootPath(explicitPath)) {
      return false;
    }

    return EN_READ_INTENT.test(message) || hasLookVerb;
  }

  private extractSearchPattern(message: string): string | undefined {
    const quotedPattern = message.match(/"(.*?)"|'(.*?)'|`(.*?)`/);
    if (quotedPattern) {
      return quotedPattern[1] ?? quotedPattern[2] ?? quotedPattern[3];
    }

    const normalized = normalizeWhitespace(message.toLowerCase());
    for (const marker of SEARCH_MARKERS) {
      const idx = normalized.indexOf(marker);
      if (idx < 0) {
        continue;
      }

      const tail = normalized.slice(idx + marker.length).trim();
      if (!tail) {
        continue;
      }

      return tail.split(' ')[0];
    }

    return undefined;
  }
}

export function buildReadInput(
  path: string,
  style: ShellStyle,
  options: { allowMissing?: boolean } = {},
): Record<string, unknown> {
  if (style === 'powershell') {
    if (options.allowMissing) {
      return powershellInput(
        `if (Test-Path -LiteralPath ${quotePowerShell(path)} -PathType Leaf) { Get-Content -LiteralPath ${quotePowerShell(path)} -Raw }`,
      );
    }
    return powershellInput(`Get-Content -LiteralPath ${quotePowerShell(path)} -Raw`);
  }
  if (options.allowMissing) {
    return {
      command: 'sh',
      args: ['-lc', '[ -f "$1" ] && cat "$1" || true', 'sh', path],
      timeoutMs: 30_000,
    };
  }
  return {
    command: 'cat',
    args: [path],
    timeoutMs: 30_000,
  };
}

export function buildListInput(path: string, recursive: boolean, style: ShellStyle): Record<string, unknown> {
  if (style === 'powershell') {
    const recurse = recursive ? ' -Recurse' : '';
    return powershellInput(`Get-ChildItem -LiteralPath ${quotePowerShell(path)}${recurse} -Force`);
  }
  return {
    command: 'find',
    args: recursive ? [path, '-type', 'f'] : [path, '-maxdepth', '1', '-print'],
    timeoutMs: 30_000,
  };
}

export function buildSearchInput(
  path: string,
  pattern: string,
  recursive: boolean,
  style: ShellStyle,
): Record<string, unknown> {
  if (style === 'powershell') {
    const recurse = recursive ? ' -Recurse' : '';
    return powershellInput(
      `Get-ChildItem -LiteralPath ${quotePowerShell(path)}${recurse} -File | Select-String -Pattern ${quotePowerShell(pattern)}`,
    );
  }
  return {
    command: 'grep',
    args: [recursive ? '-RInI' : '-InI', pattern, path],
    timeoutMs: 30_000,
  };
}

export function resolveShellStyle(metadata: Record<string, unknown> | undefined, path = ''): ShellStyle {
  const os = readMetadataString(metadata, 'runnerOs')?.toLowerCase();
  const shell = readMetadataString(metadata, 'runnerDefaultShell')?.toLowerCase();
  const separator = readMetadataString(metadata, 'runnerPathSeparator');
  const cwd = readMetadataString(metadata, 'cwd') ?? readMetadataString(metadata, 'sessionCwd') ?? '';
  if (
    os === 'windows' ||
    separator === '\\' ||
    shell?.includes('powershell') ||
    shell?.includes('pwsh') ||
    /^[A-Za-z]:[\\/]/.test(path) ||
    /^[A-Za-z]:[\\/]/.test(cwd)
  ) {
    return 'powershell';
  }
  return 'posix';
}

function powershellInput(script: string): Record<string, unknown> {
  return {
    command: 'powershell.exe',
    args: ['-NoProfile', '-Command', script],
    timeoutMs: 30_000,
  };
}

function quotePowerShell(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function readMetadataString(metadata: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = metadata?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
