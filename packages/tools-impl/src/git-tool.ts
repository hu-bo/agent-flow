import { execFile } from 'node:child_process';
import type { ToolDefinition, ToolSchema } from '@agent-flow/core';

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

export class GitTool implements ToolDefinition<GitExecInput, GitExecOutput> {
  readonly schema: ToolSchema = {
    name: 'git.exec',
    description: 'Execute a safe git command and return stdout/stderr.',
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
      (options.blockedSubcommands ?? ['reset', 'clean'])
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)
    );
  }

  async execute(input: GitExecInput): Promise<GitExecOutput> {
    if (!Array.isArray(input.args) || input.args.length === 0) {
      throw new Error('Invalid input: "args" must be a non-empty string array.');
    }

    const args = input.args.map((value) => String(value));
    const subcommand = args[0]?.trim().toLowerCase();
    if (!subcommand) {
      throw new Error('Git subcommand is missing.');
    }
    if (this.blockedSubcommands.has(subcommand)) {
      throw new Error(`Blocked git subcommand: ${subcommand}`);
    }

    return runGit(args, {
      cwd: this.cwd,
      timeoutMs: input.timeoutMs ?? 20_000
    });
  }
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
