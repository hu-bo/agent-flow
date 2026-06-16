import { execFile } from 'node:child_process';
import type { ToolDefinition, ToolSchema } from '@agent-flow/core';
import { z } from 'zod';

export interface GitToolOptions {
  cwd?: string;
  blockedSubcommands?: string[];
}

export interface GitExecInput {
  args: string[];
  timeoutMs?: number;
}

export interface GitExecOutput {
  stdout: string;
  stderr: string;
  exitCode: number;
}

const gitExecInputSchema = z.object({
  args: z.array(z.string()).min(1),
  timeoutMs: z.number().int().positive().max(120_000).optional()
});

type ParsedGitExecInput = z.infer<typeof gitExecInputSchema>;

export class GitTool implements ToolDefinition<GitExecInput, GitExecOutput> {
  readonly schema: ToolSchema = {
    name: 'git.exec',
    description: 'Execute a safe git command and return stdout/stderr.',
    risk: 'low',
    access: 'git',
    approval: 'never',
    input: {
      type: 'object',
      required: ['args'],
      properties: {
        args: {
          type: 'array',
          items: { type: 'string' },
          description: 'Git arguments list, for example: ["status", "--short"].'
        },
        timeoutMs: {
          type: 'number',
          description: 'Command timeout in milliseconds.'
        }
      }
    },
    output: {
      type: 'object',
      required: ['stdout', 'stderr', 'exitCode'],
      properties: {
        stdout: { type: 'string' },
        stderr: { type: 'string' },
        exitCode: { type: 'number' }
      }
    }
  };

  private readonly cwd: string;
  private readonly blockedSubcommands: Set<string>;

  constructor(options: GitToolOptions = {}) {
    this.cwd = options.cwd ?? process.cwd();
    this.blockedSubcommands = new Set(
      (options.blockedSubcommands ?? [
        'add',
        'apply',
        'checkout',
        'clean',
        'commit',
        'merge',
        'pull',
        'push',
        'rebase',
        'reset',
        'restore',
        'switch',
      ])
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)
    );
  }

  async execute(input: GitExecInput): Promise<GitExecOutput> {
    const parsed = parseGitExecInput(input);
    const args = parsed.args;
    const subcommand = args[0]?.trim().toLowerCase();
    if (!subcommand) {
      throw new Error('Git subcommand is missing.');
    }
    if (this.blockedSubcommands.has(subcommand)) {
      throw new Error(`Blocked git subcommand: ${subcommand}`);
    }

    return runGit(args, {
      cwd: this.cwd,
      timeoutMs: parsed.timeoutMs ?? 20_000
    });
  }
}

function parseGitExecInput(input: unknown): ParsedGitExecInput {
  const result = gitExecInputSchema.safeParse(input);
  if (!result.success) {
    throw new Error(`Invalid git.exec input: ${result.error.message}`);
  }
  return result.data;
}

interface RunGitOptions {
  cwd: string;
  timeoutMs: number;
}

function runGit(args: string[], options: RunGitOptions): Promise<GitExecOutput> {
  return new Promise((resolve, reject) => {
    const child = execFile(
      'git',
      args,
      {
        cwd: options.cwd,
        timeout: options.timeoutMs,
        windowsHide: true
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: 0
        });
      }
    );

    child.once('error', (error) => reject(error));
  });
}
