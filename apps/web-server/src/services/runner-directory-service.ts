import { randomUUID } from 'node:crypto';
import type { RunnerTask } from '@agent-flow/core';
import type {
  RunnerDirectoryEntry,
  RunnerDirectoryListResult,
  RunnerRootsResult,
} from '../contracts/api.js';
import { AppError } from '../lib/errors.js';
import type { RunnerDispatchService } from './runner-dispatch-service.js';
import type { RunnerRegistryService } from './runner-registry-service.js';

interface RunnerDirectoryInput {
  ownerUserId: string;
  runnerId: string;
}

interface RunnerListInput extends RunnerDirectoryInput {
  path: string;
  includeHidden?: boolean;
}

export class RunnerDirectoryService {
  constructor(
    private readonly runnerDispatchService: RunnerDispatchService,
    private readonly runnerRegistryService: RunnerRegistryService,
  ) {}

  async listRoots(input: RunnerDirectoryInput): Promise<RunnerRootsResult> {
    const result = await this.runDirectoryCommand(input, 'fs.roots', {});
    return normalizeRootsResult(result);
  }

  async listDirectory(input: RunnerListInput): Promise<RunnerDirectoryListResult> {
    const result = await this.runDirectoryCommand(input, 'fs.list', {
      path: input.path,
      recursive: false,
      maxEntries: 500,
      includeHidden: input.includeHidden ?? false,
    });
    return normalizeListResult(result);
  }

  private async runDirectoryCommand(
    input: RunnerDirectoryInput,
    command: 'fs.roots' | 'fs.list',
    payload: Record<string, unknown>,
  ): Promise<unknown> {
    const runner = await this.runnerRegistryService.getRunnerForUser(input.ownerUserId, input.runnerId);
    if (runner.status !== 'online') {
      throw new AppError(409, 'RUNNER_OFFLINE', `Runner is offline: ${runner.runnerId}`);
    }
    if (!supportsCapability(runner.capabilities, command)) {
      throw new AppError(409, 'RUNNER_CAPABILITY_UNSUPPORTED', `Runner does not support ${command}`);
    }

    const task: RunnerTask = {
      taskId: `runner-dir:${randomUUID()}`,
      sessionId: `runner-dir:${input.runnerId}`,
      stepId: command,
      command,
      args: [],
      timeoutMs: 15_000,
      stream: true,
      input: payload,
      metadata: {
        userId: input.ownerUserId,
        preferredRunnerId: input.runnerId,
        cwd: process.cwd(),
      },
    };

    let latestResult: unknown;
    let completed = false;
    for await (const event of this.runnerDispatchService.execute(task)) {
      if (event.type === 'result') {
        latestResult = event.result;
      }
      if (event.type === 'completed') {
        completed = true;
      }
      if (event.type === 'error') {
        throw new AppError(502, 'RUNNER_DIRECTORY_FAILED', event.error || `Runner ${command} failed`);
      }
    }
    if (!completed) {
      throw new AppError(502, 'RUNNER_DIRECTORY_FAILED', `Runner ${command} ended before completion`);
    }
    return latestResult;
  }
}

function normalizeRootsResult(value: unknown): RunnerRootsResult {
  const roots = isRecord(value) && Array.isArray(value.roots) ? value.roots : [];
  return {
    roots: roots.map(normalizeEntry).filter((entry): entry is RunnerDirectoryEntry => Boolean(entry)),
  };
}

function normalizeListResult(value: unknown): RunnerDirectoryListResult {
  if (!isRecord(value)) {
    throw new AppError(502, 'RUNNER_DIRECTORY_INVALID_RESULT', 'Runner returned an invalid directory list');
  }
  const entries = Array.isArray(value.entries) ? value.entries : [];
  const normalizedEntries = entries
    .map(normalizeEntry)
    .filter((entry): entry is RunnerDirectoryEntry => Boolean(entry));
  return {
    path: typeof value.path === 'string' ? value.path : '',
    entries: normalizedEntries,
    total: typeof value.total === 'number' ? value.total : normalizedEntries.length,
  };
}

function normalizeEntry(value: unknown): RunnerDirectoryEntry | undefined {
  if (!isRecord(value) || typeof value.path !== 'string' || typeof value.name !== 'string') {
    return undefined;
  }
  const type = value.type === 'directory' ? 'directory' : 'file';
  return {
    path: value.path,
    name: value.name,
    type,
    ...(typeof value.size === 'number' ? { size: value.size } : {}),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function supportsCapability(capabilities: string[] | undefined, command: 'fs.roots' | 'fs.list'): boolean {
  if (!Array.isArray(capabilities) || capabilities.length === 0) {
    return true;
  }
  if (capabilities.includes(command)) {
    return true;
  }
  return command === 'fs.roots' && capabilities.includes('fs.list');
}
