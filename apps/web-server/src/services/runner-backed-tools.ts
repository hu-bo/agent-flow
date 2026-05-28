import type {
  RunnerTask,
  ToolContext,
  ToolDefinition,
  ToolRegistryLike,
  ToolSchema,
} from '@agent-flow/core';
import { z } from 'zod';
import { AppError } from '../lib/errors.js';
import { encodeApprovalRequiredError, extractApprovalRequiredFromError } from '../lib/approval.js';
import type { RunnerDispatchService } from './runner-dispatch-service.js';

type RunnerBackedToolName =
  | 'fs.read'
  | 'fs.write'
  | 'fs.patch'
  | 'fs.list'
  | 'fs.search'
  | 'shell.exec';

interface RunnerBackedToolOptions {
  dispatchService: RunnerDispatchService;
  name: RunnerBackedToolName;
  description: string;
  input: ToolSchema['input'];
  zodInput: z.ZodType<Record<string, unknown>>;
}

class RunnerBackedTool implements ToolDefinition<Record<string, unknown>, unknown> {
  readonly schema: ToolSchema;

  constructor(private readonly options: RunnerBackedToolOptions) {
    this.schema = {
      name: options.name,
      description: options.description,
      input: options.input,
    };
  }

  async execute(input: Record<string, unknown>, context: ToolContext): Promise<unknown> {
    const parsedInput = parseRunnerBackedToolInput(this.options.name, this.options.zodInput, input);
    const task: RunnerTask = {
      taskId: `${context.taskId}:${context.stepId}`,
      sessionId: context.sessionId,
      stepId: context.stepId,
      command: this.options.name,
      args: parseRunnerArgs(parsedInput),
      stream: true,
      input: parsedInput,
      metadata: context.metadata,
    };

    let latestResult: unknown;
    let completed = false;
    try {
      for await (const event of this.options.dispatchService.execute(task, context.signal)) {
        if (event.type === 'result') {
          latestResult = event.result;
        } else if (event.type === 'completed') {
          completed = true;
        } else if (event.type === 'error') {
          throw new Error(event.error);
        }
      }
    } catch (error) {
      const approval =
        extractApprovalRequiredFromError(error) ??
        (error instanceof AppError && error.code === 'APPROVAL_REQUIRED'
          ? {
              session_id: context.sessionId,
              cmd: this.options.name,
              workdir: resolveWorkingDir(context.metadata),
              risk: 'high' as const,
              reason: error.message,
            }
          : null);
      if (approval) {
        throw new Error(encodeApprovalRequiredError(approval));
      }
      if (error instanceof AppError) {
        throw new Error(error.message);
      }
      throw error;
    }

    if (!completed) {
      throw new Error(`Runner task for "${this.options.name}" ended before completion.`);
    }

    return latestResult ?? null;
  }
}

function resolveWorkingDir(metadata: Record<string, unknown> | undefined): string {
  const cwd = metadata?.cwd;
  if (typeof cwd === 'string' && cwd.trim().length > 0) {
    return cwd.trim();
  }
  const sessionCwd = metadata?.sessionCwd;
  if (typeof sessionCwd === 'string' && sessionCwd.trim().length > 0) {
    return sessionCwd.trim();
  }
  return process.cwd();
}

const runnerBackedInputSchemas = {
  fsRead: z.object({
    path: z.string().trim().min(1),
    encoding: z.literal('utf8').optional(),
    maxBytes: z.number().int().positive().max(10_000_000).optional(),
    allowMissing: z.boolean().optional(),
  }),
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
  fsList: z.object({
    path: z.string().trim().min(1).optional(),
    recursive: z.boolean().optional(),
    maxEntries: z.number().int().positive().max(5_000).optional(),
    includeHidden: z.boolean().optional(),
  }),
  fsSearch: z.object({
    path: z.string().trim().min(1).optional(),
    pattern: z.string().trim().min(1),
    recursive: z.boolean().optional(),
    maxMatches: z.number().int().positive().max(1_000).optional(),
    includeHidden: z.boolean().optional(),
  }),
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
  return [
    new RunnerBackedTool({
      dispatchService,
      name: 'fs.read',
      description: 'Read a UTF-8 file from the bound runner workspace.',
      zodInput: runnerBackedInputSchemas.fsRead,
      input: {
        type: 'object',
        required: ['path'],
        properties: {
          path: { type: 'string', description: 'Workspace-relative file path.' },
          encoding: { type: 'string', description: 'Encoding. Only utf8 is supported.' },
          maxBytes: { type: 'number', description: 'Maximum readable file size in bytes.' },
          allowMissing: { type: 'boolean', description: 'Return an empty result when the file is missing.' },
        },
      },
    }),
    new RunnerBackedTool({
      dispatchService,
      name: 'fs.write',
      description: 'Write a UTF-8 file inside the bound runner workspace.',
      zodInput: runnerBackedInputSchemas.fsWrite,
      input: {
        type: 'object',
        required: ['path', 'content'],
        properties: {
          path: { type: 'string', description: 'Workspace-relative file path.' },
          content: { type: 'string', description: 'File content to write.' },
          encoding: { type: 'string', description: 'Encoding. Only utf8 is supported.' },
        },
      },
    }),
    new RunnerBackedTool({
      dispatchService,
      name: 'fs.patch',
      description: 'Patch a UTF-8 file inside the bound runner workspace by replacing text.',
      zodInput: runnerBackedInputSchemas.fsPatch,
      input: {
        type: 'object',
        required: ['path', 'search', 'replace'],
        properties: {
          path: { type: 'string', description: 'Workspace-relative file path.' },
          search: { type: 'string', description: 'Text to search for.' },
          replace: { type: 'string', description: 'Replacement text.' },
          replaceAll: { type: 'boolean', description: 'Replace all matches instead of the first match.' },
        },
      },
    }),
    new RunnerBackedTool({
      dispatchService,
      name: 'fs.list',
      description: 'List files under a directory in the bound runner workspace.',
      zodInput: runnerBackedInputSchemas.fsList,
      input: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Workspace-relative directory path. Defaults to current directory.' },
          recursive: { type: 'boolean', description: 'Whether to list recursively.' },
          maxEntries: { type: 'number', description: 'Maximum number of entries to return.' },
          includeHidden: { type: 'boolean', description: 'Whether to include hidden files.' },
        },
      },
    }),
    new RunnerBackedTool({
      dispatchService,
      name: 'fs.search',
      description: 'Search files under a directory in the bound runner workspace.',
      zodInput: runnerBackedInputSchemas.fsSearch,
      input: {
        type: 'object',
        required: ['pattern'],
        properties: {
          path: { type: 'string', description: 'Workspace-relative directory path. Defaults to current directory.' },
          pattern: { type: 'string', description: 'String or regular expression pattern to search for.' },
          recursive: { type: 'boolean', description: 'Whether to search recursively.' },
          maxMatches: { type: 'number', description: 'Maximum number of matches to return.' },
          includeHidden: { type: 'boolean', description: 'Whether to include hidden files.' },
        },
      },
    }),
    new RunnerBackedTool({
      dispatchService,
      name: 'shell.exec',
      description: 'Execute a shell command through the bound runner.',
      zodInput: runnerBackedInputSchemas.shellExec,
      input: {
        type: 'object',
        required: ['command'],
        properties: {
          command: { type: 'string', description: 'Command executable or script to run.' },
          args: {
            type: 'array',
            description: 'Command arguments.',
            items: { type: 'string' },
          },
          workingDir: { type: 'string', description: 'Optional working directory inside the runner workspace.' },
          timeoutMs: { type: 'number', description: 'Timeout in milliseconds.' },
          env: { type: 'object', description: 'Additional environment variables.' },
        },
      },
    }),
  ];
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
