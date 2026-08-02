import type {
  RunnerTask,
  ToolContext,
  ToolDefinition,
  ToolRegistryLike,
  ToolSchema,
} from '@agent-flow/core';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import type { RunnerDispatchService } from './runner-dispatch-service.js';

type RunnerBackedToolName =
  | 'fs.read'
  | 'fs.stat'
  | 'fs.write'
  | 'fs.patch'
  | 'fs.multiPatch'
  | 'fs.applyPatch'
  | 'fs.list'
  | 'fs.glob'
  | 'fs.search'
  | 'git.status'
  | 'git.diff'
  | 'git.show'
  | 'git.apply'
  | 'shell.exec';

interface RunnerBackedToolOptions {
  dispatchService: RunnerDispatchService;
  name: RunnerBackedToolName;
  description: string;
  risk: NonNullable<ToolSchema['risk']>;
  access: NonNullable<ToolSchema['access']>;
  approval: NonNullable<ToolSchema['approval']>;
  zodInput: z.ZodType<Record<string, unknown>>;
}

class RunnerBackedTool implements ToolDefinition<Record<string, unknown>, unknown> {
  readonly schema: ToolSchema;

  constructor(private readonly options: RunnerBackedToolOptions) {
    this.schema = {
      name: options.name,
      description: options.description,
      input: toToolInputSchema(options.zodInput),
      risk: options.risk,
      access: options.access,
      approval: options.approval,
    };
  }

  async execute(input: Record<string, unknown>, context: ToolContext): Promise<unknown> {
    const parsedInput = parseRunnerBackedToolInput(this.options.name, this.options.zodInput, input);
    const runnerInput = this.options.name === 'shell.exec'
      ? normalizeShellExecInput(parsedInput)
      : parsedInput;
    const task: RunnerTask = {
      taskId: `${context.taskId}:${context.stepId}`,
      sessionId: context.sessionId,
      stepId: context.stepId,
      command: this.options.name,
      args: parseRunnerArgs(runnerInput),
      stream: true,
      input: runnerInput,
      metadata: {
        ...(context.metadata ?? {}),
        risk: this.options.risk,
        approvalPolicy: this.options.approval,
        toolFamily: this.options.access === 'execute' ? 'bash' : 'fs',
      },
    };

    let latestResult: unknown;
    let completed = false;
    for await (const event of this.options.dispatchService.execute(task, context.signal)) {
      await context.onEvent?.('runner.event', {
        runnerEvent: event,
      });
      if (event.type === 'approval_request') {
        await context.onEvent?.('approval_request', {
          requestId: event.requestId,
          sessionId: event.sessionId,
          command: event.command,
          workingDir: event.workingDir,
          risk: event.risk,
          reason: event.reason,
          runnerId: event.runnerId,
          scopeType: event.scopeType,
          scopeId: event.scopeId,
          scopeLabel: event.scopeLabel,
        });
      } else if (event.type === 'approval_response') {
        await context.onEvent?.('approval_response', {
          requestId: event.requestId,
          sessionId: event.sessionId,
          command: event.command,
          workingDir: event.workingDir,
          approved: event.approved,
          decision: event.decision,
          persistentGrantId: event.persistentGrantId,
          reason: event.reason,
          runnerId: event.runnerId,
        });
      } else if (event.type === 'result') {
        latestResult = event.result;
      } else if (event.type === 'completed') {
        completed = true;
      } else if (event.type === 'error') {
        throw new Error(event.error);
      }
    }

    if (!completed) {
      throw new Error(`Runner task for "${this.options.name}" ended before completion.`);
    }

    return latestResult ?? null;
  }
}

const runnerBackedInputSchemas = {
  fsRead: z.object({
    path: z.string().trim().min(1),
    encoding: z.literal('utf8').optional(),
    maxBytes: z.number().int().positive().max(10_000_000).optional(),
    allowMissing: z.boolean().optional(),
    byteOffset: z.number().int().nonnegative().optional(),
    byteLength: z.number().int().positive().max(10_000_000).optional(),
    startLine: z.number().int().positive().optional(),
    endLine: z.number().int().positive().optional(),
  }),
  fsStat: z.object({ path: z.string().trim().min(1) }),
  fsWrite: z.object({
    path: z.string().trim().min(1),
    content: z.string(),
    encoding: z.literal('utf8').optional(),
  }),
  fsPatch: z.object({
    path: z.string().trim().min(1),
    search: z.string().min(1),
    replace: z.string(),
    replaceAll: z.boolean().optional(),
  }),
  fsMultiPatch: z.object({
    path: z.string().trim().min(1),
    edits: z.array(z.object({
      search: z.string().min(1),
      replace: z.string(),
      replaceAll: z.boolean().optional(),
    })).min(1).max(100),
  }),
  fsApplyPatch: z.object({
    path: z.string().trim().min(1),
    patch: z.string().min(1),
    expectedSha256: z.string().regex(/^[a-fA-F0-9]{64}$/).optional(),
    expectedContent: z.string().optional(),
  }),
  fsList: z.object({
    path: z.string().trim().min(1).optional(),
    recursive: z.boolean().optional(),
    maxEntries: z.number().int().positive().max(5_000).optional(),
    includeHidden: z.boolean().optional(),
  }),
  fsGlob: z.object({
    path: z.string().trim().min(1).optional(),
    pattern: z.string().trim().min(1),
    maxEntries: z.number().int().positive().max(5_000).optional(),
  }),
  fsSearch: z.object({
    path: z.string().trim().min(1).optional(),
    pattern: z.string().trim().min(1),
    recursive: z.boolean().optional(),
    maxMatches: z.number().int().positive().max(1_000).optional(),
    includeHidden: z.boolean().optional(),
  }),
  gitStatus: z.object({ pathspec: z.array(z.string().trim().min(1)).max(100).optional() }),
  gitDiff: z.object({
    cached: z.boolean().optional(),
    base: z.string().trim().min(1).optional(),
    pathspec: z.array(z.string().trim().min(1)).max(100).optional(),
  }),
  gitShow: z.object({ revision: z.string().trim().min(1).optional(), path: z.string().trim().min(1).optional() }),
  gitApply: z.object({ patch: z.string().min(1), reverse: z.boolean().optional() }),
  shellExec: z.object({
    command: z.string().trim().min(1),
    args: z.array(z.string()).optional(),
    workingDir: z.string().trim().min(1).optional(),
    timeoutMs: z.number().int().positive().max(120_000).optional(),
    env: z.record(z.string()).optional(),
  }),
} satisfies Record<string, z.ZodType<Record<string, unknown>>>;

export function registerRunnerBackedTools(
  registry: ToolRegistryLike,
  dispatchService: RunnerDispatchService,
): { registered: string[]; skipped: string[] } {
  const registered: string[] = [];
  const skipped: string[] = [];

  for (const tool of createRunnerBackedTools(dispatchService)) {
    if (registry.get(tool.schema.name)) {
      skipped.push(tool.schema.name);
      continue;
    }
    registry.register(tool);
    registered.push(tool.schema.name);
  }

  return { registered, skipped };
}

function createRunnerBackedTools(dispatchService: RunnerDispatchService): ToolDefinition<Record<string, unknown>, unknown>[] {
  const catalog: Array<Omit<RunnerBackedToolOptions, 'dispatchService'>> = [
    { name: 'fs.read', description: 'Read a UTF-8 file from the bound runner workspace.', zodInput: runnerBackedInputSchemas.fsRead, risk: 'low', access: 'read', approval: 'never' },
    { name: 'fs.stat', description: 'Inspect file metadata and content identity in the bound runner workspace.', zodInput: runnerBackedInputSchemas.fsStat, risk: 'low', access: 'read', approval: 'never' },
    { name: 'fs.write', description: 'Write a UTF-8 file inside the bound runner workspace.', zodInput: runnerBackedInputSchemas.fsWrite, risk: 'high', access: 'write', approval: 'on_write' },
    { name: 'fs.patch', description: 'Patch a UTF-8 file inside the bound runner workspace by replacing text.', zodInput: runnerBackedInputSchemas.fsPatch, risk: 'high', access: 'write', approval: 'on_write' },
    { name: 'fs.multiPatch', description: 'Apply multiple text replacements to one UTF-8 file inside the bound runner workspace.', zodInput: runnerBackedInputSchemas.fsMultiPatch, risk: 'high', access: 'write', approval: 'on_write' },
    { name: 'fs.applyPatch', description: 'Atomically apply a unified diff with optional content preconditions.', zodInput: runnerBackedInputSchemas.fsApplyPatch, risk: 'high', access: 'write', approval: 'on_write' },
    { name: 'fs.list', description: 'List files under a directory in the bound runner workspace.', zodInput: runnerBackedInputSchemas.fsList, risk: 'low', access: 'read', approval: 'never' },
    { name: 'fs.glob', description: 'Find workspace files by path pattern with bounded results.', zodInput: runnerBackedInputSchemas.fsGlob, risk: 'low', access: 'read', approval: 'never' },
    { name: 'fs.search', description: 'Search files under a directory in the bound runner workspace.', zodInput: runnerBackedInputSchemas.fsSearch, risk: 'low', access: 'read', approval: 'never' },
    { name: 'shell.exec', description: 'Execute a shell command through the bound runner.', zodInput: runnerBackedInputSchemas.shellExec, risk: 'high', access: 'execute', approval: 'always' },
    { name: 'git.status', description: 'Read structured Git worktree status from the bound workspace.', zodInput: runnerBackedInputSchemas.gitStatus, risk: 'low', access: 'git', approval: 'never' },
    { name: 'git.diff', description: 'Read a bounded Git patch from the bound workspace.', zodInput: runnerBackedInputSchemas.gitDiff, risk: 'low', access: 'git', approval: 'never' },
    { name: 'git.show', description: 'Inspect a revision or path through Git in the bound workspace.', zodInput: runnerBackedInputSchemas.gitShow, risk: 'low', access: 'git', approval: 'never' },
    { name: 'git.apply', description: 'Validate and apply a Git patch in the bound workspace.', zodInput: runnerBackedInputSchemas.gitApply, risk: 'high', access: 'git', approval: 'on_write' },
  ];

  return catalog.map((tool) => new RunnerBackedTool({ ...tool, dispatchService }));
}

function toToolInputSchema(schema: z.ZodType<Record<string, unknown>>): ToolSchema['input'] {
  const generated = zodToJsonSchema(schema, { $refStrategy: 'none' }) as Record<string, unknown>;
  const { $schema: _schemaVersion, definitions: _definitions, ...input } = generated;
  return input as ToolSchema['input'];
}

function parseRunnerBackedToolInput(
  toolName: RunnerBackedToolName,
  schema: z.ZodType<Record<string, unknown>>,
  input: unknown,
): Record<string, unknown> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new Error(`Invalid ${toolName} input: ${result.error.message}`);
  }
  return result.data;
}

function parseRunnerArgs(input: Record<string, unknown>): string[] {
  if (!Array.isArray(input.args)) {
    return [];
  }
  return input.args.map((value) => String(value));
}

function normalizeShellExecInput(input: Record<string, unknown>): Record<string, unknown> {
  if (Array.isArray(input.args) && input.args.length > 0) {
    return input;
  }
  if (typeof input.command !== 'string') {
    return input;
  }

  const parts = splitCommandLine(input.command);
  if (parts.length <= 1) {
    return input;
  }

  return {
    ...input,
    command: parts[0],
    args: parts.slice(1),
  };
}

function splitCommandLine(commandLine: string): string[] {
  const parts: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;
  let escaping = false;

  for (const char of commandLine.trim()) {
    if (escaping) {
      current += char;
      escaping = false;
      continue;
    }

    if (char === '\\' && quote === '"') {
      escaping = true;
      continue;
    }

    if ((char === '"' || char === "'") && (!quote || quote === char)) {
      quote = quote ? null : char;
      continue;
    }

    if (!quote && /\s/.test(char)) {
      if (current.length > 0) {
        parts.push(current);
        current = '';
      }
      continue;
    }

    current += char;
  }

  if (escaping) {
    current += '\\';
  }
  if (current.length > 0) {
    parts.push(current);
  }
  return parts;
}
