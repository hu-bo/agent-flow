import type {
  RunnerFilesChangedFile,
  RunnerFilesChangedHunk,
  RunnerFilesChangedLine,
  RunnerFilesChangedPayload,
} from '@agent-flow/core/messages';
import type { ToolExecutorLike } from '@agent-flow/core';

const RUNNER_DIFF_CONTEXT_LINES = 10;
const RUNNER_DIFF_READ_MAX_BYTES = 256_000;
const RUNNER_DIFF_CONTENT_MAX_CHARS = 200_000;
const RUNNER_DIFF_MAX_LINES = 4_000;

interface ToolExecutionContext {
  taskId: string;
  sessionId: string;
  stepId: string;
  metadata?: Record<string, unknown>;
}

interface RunnerFileSnapshotOk {
  ok: true;
  content: string;
  truncated: boolean;
}

interface RunnerFileSnapshotUnavailable {
  ok: false;
  reason: string;
  truncated: boolean;
}

type RunnerFileSnapshot = RunnerFileSnapshotOk | RunnerFileSnapshotUnavailable;

export interface ToolResultOutputEnhancer {
  finalize(output: unknown): Promise<unknown>;
}

interface ToolResultOutputEnhancerFactoryInput {
  toolExecutor: ToolExecutorLike;
  toolName: string;
  toolInput: Record<string, unknown>;
  toolContext: ToolExecutionContext;
}

export async function createToolResultOutputEnhancer(
  input: ToolResultOutputEnhancerFactoryInput,
): Promise<ToolResultOutputEnhancer | null> {
  const factory = new RunnerFilesChangedOutputEnhancerFactory();
  if (!factory.supports(input.toolName, input.toolInput)) {
    return null;
  }
  return factory.prepare(input);
}

interface ToolResultOutputEnhancerFactory {
  supports(toolName: string, toolInput: Record<string, unknown>): boolean;
  prepare(input: ToolResultOutputEnhancerFactoryInput): Promise<ToolResultOutputEnhancer>;
}

class RunnerFilesChangedOutputEnhancerFactory implements ToolResultOutputEnhancerFactory {
  supports(toolName: string, toolInput: Record<string, unknown>): boolean {
    return isRunnerFsMutationTool(toolName) && typeof toolInput.path === 'string' && toolInput.path.trim().length > 0;
  }

  async prepare(input: ToolResultOutputEnhancerFactoryInput): Promise<ToolResultOutputEnhancer> {
    const path = String(input.toolInput.path).trim();
    const before = await captureRunnerFileSnapshot(
      input.toolExecutor,
      path,
      toDiffReadContext(input.toolContext, 'before'),
    );

    return new RunnerFilesChangedOutputEnhancer({
      toolExecutor: input.toolExecutor,
      toolContext: input.toolContext,
      path,
      before,
    });
  }
}

class RunnerFilesChangedOutputEnhancer implements ToolResultOutputEnhancer {
  constructor(
    private readonly args: {
      toolExecutor: ToolExecutorLike;
      toolContext: ToolExecutionContext;
      path: string;
      before: RunnerFileSnapshot;
    },
  ) {}

  async finalize(output: unknown): Promise<RunnerFilesChangedPayload> {
    const after = await captureRunnerFileSnapshot(
      this.args.toolExecutor,
      this.args.path,
      toDiffReadContext(this.args.toolContext, 'after'),
    );

    const file = buildRunnerFilesChangedFile(this.args.path, this.args.before, after);
    return {
      type: 'runner-files-changed',
      version: 1,
      source: 'runner-host',
      summary: {
        filesChanged: 1,
        additions: file.additions,
        deletions: file.deletions,
        truncated: file.truncated,
      },
      files: [file],
      rawOutput: output,
    };
  }
}

function toDiffReadContext(
  context: ToolExecutionContext,
  stage: 'before' | 'after',
): ToolExecutionContext {
  return {
    ...context,
    stepId: `${context.stepId}_diff_${stage}`,
  };
}

function isRunnerFsMutationTool(toolName: string): boolean {
  return toolName === 'fs.write' || toolName === 'fs.patch';
}

async function captureRunnerFileSnapshot(
  toolExecutor: ToolExecutorLike,
  path: string,
  context: ToolExecutionContext,
): Promise<RunnerFileSnapshot> {
  const readResult = await toolExecutor.execute(
    {
      name: 'fs.read',
      input: {
        path,
        maxBytes: RUNNER_DIFF_READ_MAX_BYTES,
      },
    },
    context,
    { retries: 0 },
  );

  if (!readResult.ok) {
    return {
      ok: false,
      reason: readResult.error ?? 'failed to read file',
      truncated: false,
    };
  }

  const payload = readResult.output;
  if (!isPlainObject(payload)) {
    return {
      ok: false,
      reason: 'fs.read returned a non-object payload',
      truncated: false,
    };
  }

  const content = getObjectString(payload, 'content');
  if (typeof content !== 'string') {
    return {
      ok: false,
      reason: 'fs.read did not return string content',
      truncated: false,
    };
  }

  if (content.length > RUNNER_DIFF_CONTENT_MAX_CHARS) {
    return {
      ok: false,
      reason: `file content exceeds preview limit (${RUNNER_DIFF_CONTENT_MAX_CHARS} chars)`,
      truncated: true,
    };
  }

  return {
    ok: true,
    content,
    truncated: false,
  };
}

function buildRunnerFilesChangedFile(
  path: string,
  before: RunnerFileSnapshot,
  after: RunnerFileSnapshot,
): RunnerFilesChangedFile {
  const unavailable = !before.ok ? before.reason : !after.ok ? after.reason : undefined;
  const truncated = Boolean(before.truncated || after.truncated);

  if (!before.ok || !after.ok) {
    return {
      path,
      additions: 0,
      deletions: 0,
      diffPreview: null,
      truncated,
      unavailableReason: unavailable ?? 'diff unavailable',
    };
  }

  const oldLines = splitNormalizedLines(before.content);
  const newLines = splitNormalizedLines(after.content);

  if (oldLines.length > RUNNER_DIFF_MAX_LINES || newLines.length > RUNNER_DIFF_MAX_LINES) {
    return {
      path,
      additions: 0,
      deletions: 0,
      diffPreview: null,
      truncated: true,
      unavailableReason: `file exceeds line limit (${RUNNER_DIFF_MAX_LINES}) for diff preview`,
    };
  }

  const diff = buildLineDiff(oldLines, newLines);
  return {
    path,
    additions: diff.additions,
    deletions: diff.deletions,
    diffPreview: {
      contextLines: RUNNER_DIFF_CONTEXT_LINES,
      hunks: diff.hunks,
    },
    truncated,
  };
}

function splitNormalizedLines(value: string): string[] {
  const normalized = value.replace(/\r\n/g, '\n');
  if (normalized.length === 0) {
    return [];
  }
  const lines = normalized.split('\n');
  if (lines[lines.length - 1] === '') {
    lines.pop();
  }
  return lines;
}

interface DiffWalkEntry {
  type: 'context' | 'add' | 'del';
  text: string;
  oldLine: number | null;
  newLine: number | null;
}

function buildLineDiff(oldLines: string[], newLines: string[]): {
  additions: number;
  deletions: number;
  hunks: RunnerFilesChangedHunk[];
} {
  const matrix = buildLcsMatrix(oldLines, newLines);
  const entries = walkDiffEntries(oldLines, newLines, matrix);
  const additions = entries.reduce((count, entry) => (entry.type === 'add' ? count + 1 : count), 0);
  const deletions = entries.reduce((count, entry) => (entry.type === 'del' ? count + 1 : count), 0);
  const hunks = buildDiffHunks(entries, RUNNER_DIFF_CONTEXT_LINES);
  return { additions, deletions, hunks };
}

function buildLcsMatrix(oldLines: string[], newLines: string[]): number[][] {
  const oldLen = oldLines.length;
  const newLen = newLines.length;
  const matrix = Array.from({ length: oldLen + 1 }, () => Array<number>(newLen + 1).fill(0));

  for (let i = oldLen - 1; i >= 0; i -= 1) {
    for (let j = newLen - 1; j >= 0; j -= 1) {
      if (oldLines[i] === newLines[j]) {
        matrix[i][j] = matrix[i + 1][j + 1] + 1;
      } else {
        matrix[i][j] = Math.max(matrix[i + 1][j], matrix[i][j + 1]);
      }
    }
  }

  return matrix;
}

function walkDiffEntries(oldLines: string[], newLines: string[], matrix: number[][]): DiffWalkEntry[] {
  const entries: DiffWalkEntry[] = [];
  let i = 0;
  let j = 0;
  let oldLineNo = 1;
  let newLineNo = 1;

  while (i < oldLines.length && j < newLines.length) {
    if (oldLines[i] === newLines[j]) {
      entries.push({
        type: 'context',
        text: oldLines[i],
        oldLine: oldLineNo,
        newLine: newLineNo,
      });
      i += 1;
      j += 1;
      oldLineNo += 1;
      newLineNo += 1;
      continue;
    }

    if (matrix[i + 1][j] >= matrix[i][j + 1]) {
      entries.push({
        type: 'del',
        text: oldLines[i],
        oldLine: oldLineNo,
        newLine: null,
      });
      i += 1;
      oldLineNo += 1;
      continue;
    }

    entries.push({
      type: 'add',
      text: newLines[j],
      oldLine: null,
      newLine: newLineNo,
    });
    j += 1;
    newLineNo += 1;
  }

  while (i < oldLines.length) {
    entries.push({
      type: 'del',
      text: oldLines[i],
      oldLine: oldLineNo,
      newLine: null,
    });
    i += 1;
    oldLineNo += 1;
  }

  while (j < newLines.length) {
    entries.push({
      type: 'add',
      text: newLines[j],
      oldLine: null,
      newLine: newLineNo,
    });
    j += 1;
    newLineNo += 1;
  }

  return entries;
}

function buildDiffHunks(entries: DiffWalkEntry[], contextLines: number): RunnerFilesChangedHunk[] {
  const changeIndices = entries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => entry.type !== 'context')
    .map(({ index }) => index);

  if (changeIndices.length === 0) {
    return [];
  }

  const ranges: Array<{ start: number; end: number }> = [];
  for (const changedIndex of changeIndices) {
    const nextRange = {
      start: Math.max(0, changedIndex - contextLines),
      end: Math.min(entries.length - 1, changedIndex + contextLines),
    };
    const prev = ranges[ranges.length - 1];
    if (!prev || nextRange.start > prev.end + 1) {
      ranges.push(nextRange);
    } else {
      prev.end = Math.max(prev.end, nextRange.end);
    }
  }

  return ranges.map((range) => {
    const hunkEntries = entries.slice(range.start, range.end + 1);
    const oldStart = hunkEntries.find((entry) => entry.oldLine !== null)?.oldLine ?? 0;
    const newStart = hunkEntries.find((entry) => entry.newLine !== null)?.newLine ?? 0;
    const oldLines = hunkEntries.reduce((count, entry) => (entry.oldLine !== null ? count + 1 : count), 0);
    const newLines = hunkEntries.reduce((count, entry) => (entry.newLine !== null ? count + 1 : count), 0);

    const lines: RunnerFilesChangedLine[] = hunkEntries.map((entry) => ({
      type: entry.type,
      text: entry.text,
      oldLine: entry.oldLine,
      newLine: entry.newLine,
    }));

    return {
      header: `@@ -${formatHunkRange(oldStart, oldLines)} +${formatHunkRange(newStart, newLines)} @@`,
      oldStart,
      oldLines,
      newStart,
      newLines,
      lines,
    };
  });
}

function formatHunkRange(start: number, count: number): string {
  if (count === 1) {
    return String(start);
  }
  return `${start},${count}`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getObjectString(value: Record<string, unknown>, key: string): string | undefined {
  const target = value[key];
  return typeof target === 'string' ? target : undefined;
}
