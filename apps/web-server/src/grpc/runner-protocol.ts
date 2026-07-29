import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPackageDefinition } from '@grpc/grpc-js';
import type { ServiceDefinition } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';

export interface ConnectRegisterMessage {
  runnerToken: string;
  runnerId?: string;
  kind?: 'local' | 'remote' | 'sandbox';
  host?: string;
  hostName?: string;
  hostIp?: string;
  version?: string;
  capabilities?: string[];
  os?: string;
  arch?: string;
  defaultShell?: string;
  pathSeparator?: string;
  lineEnding?: string;
  workspaceRoots?: string[];
  availableCommands?: string[];
  capabilitySchemaVersion?: number;
  isolationLevel?: string;
  availableEngines?: string[];
  logicalCpuCount?: number;
  memoryBytes?: number;
  maxConcurrentTasks?: number;
  activeTasks?: number;
}

export interface ConnectHeartbeatMessage {
  runnerId: string;
  runnerToken: string;
  activeTasks?: number;
  maxConcurrentTasks?: number;
}

export interface RunnerTaskEventMessage {
  taskId: string;
  executionId?: string;
  attempt?: number;
  eventSequence?: number;
  timestamp?: string;
  runnerId?: string;
  type?: string;
  started?: { message?: string };
  stdout?: { chunk?: string; chunkSequence?: number; byteOffset?: number; truncated?: boolean };
  stderr?: { chunk?: string; chunkSequence?: number; byteOffset?: number; truncated?: boolean };
  progress?: { message?: string; percent?: number };
  result?: {
    outputJson?: Uint8Array | string;
    stdoutBytes?: number;
    stderrBytes?: number;
    outputTruncated?: boolean;
  };
  error?: { message?: string; retryable?: boolean; failureType?: string; code?: string };
  completed?: {
    exitCode?: number;
    durationMs?: number;
    status?: string;
    failureType?: string;
    message?: string;
    stdoutBytes?: number;
    stderrBytes?: number;
    outputTruncated?: boolean;
  };
}

export interface RunnerEnvelopeMessage {
  register?: ConnectRegisterMessage;
  heartbeat?: ConnectHeartbeatMessage;
  taskEvent?: RunnerTaskEventMessage;
  dispatchAck?: {
    taskId: string;
    executionId: string;
    attempt: number;
    accepted: boolean;
    state?: string;
    message?: string;
    lastEventSequence?: number;
  };
  cancelAck?: {
    taskId: string;
    executionId: string;
    attempt: number;
    accepted: boolean;
    state?: string;
    message?: string;
  };
}

export interface ServerEnvelopeMessage {
  registerAck?: {
    runnerId: string;
    status: string;
    heartbeatIntervalMs: number;
    serverTime: string;
  };
  runTask?: {
    taskId: string;
    sessionId: string;
    stepId: string;
    command: string;
    args: string[];
    env: Record<string, string>;
    workingDir: string;
    timeoutMs: number;
    stream: boolean;
    inputJson?: Uint8Array;
    engine: string;
    sandboxPolicy: {
      enabled: boolean;
      readOnly: boolean;
      allowNetwork: boolean;
      allowedWorkingDirs: string[];
      allowedReadPaths: string[];
      allowedWritePaths: string[];
      blockedCommandFragments: string[];
      allowedEnvKeys: string[];
      deniedEnvKeys: string[];
    };
    docker?: {
      image: string;
      workDir: string;
      user: string;
      networkDisabled: boolean;
      readOnlyRootFs: boolean;
      mounts: Array<{ source: string; target: string; readOnly: boolean }>;
      cpuLimitMillis: number;
      memoryLimitBytes: number;
      pidsLimit: number;
      diskLimitBytes: number;
    };
    executionId: string;
    attempt: number;
    deadline: string;
    maxOutputBytes: number;
    resumeFromEventSequence: number;
  };
  cancelTask?: {
    taskId: string;
    executionId: string;
    attempt: number;
    reason: string;
  };
  ping?: {
    serverTime: string;
  };
  eventAck?: {
    executionId: string;
    attempt: number;
    eventSequence: number;
  };
}

export function loadRunnerServiceDefinition(): ServiceDefinition {
  const packageDefinition = loadSync(resolveRunnerProtoPath(), {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  const loaded = loadPackageDefinition(packageDefinition) as Record<string, unknown>;
  const maybeService = (((loaded.agentflow as Record<string, unknown> | undefined)?.runner as
    | Record<string, unknown>
    | undefined)?.v1 as Record<string, unknown> | undefined)?.RunnerService as
    | { service?: ServiceDefinition }
    | undefined;

  if (!maybeService?.service) {
    throw new Error('RunnerService definition not found in loaded runner.proto package');
  }
  return maybeService.service;
}

function resolveRunnerProtoPath(): string {
  const here = fileURLToPath(new URL('.', import.meta.url));
  const configuredPath = process.env.RUNNER_PROTO_PATH?.trim();
  const candidates = [
    ...(configuredPath ? [resolve(configuredPath)] : []),
    resolve(here, '..', 'protocol', 'proto', 'runner.proto'),
    resolve(process.cwd(), 'protocol', 'proto', 'runner.proto'),
    resolve(process.cwd(), '..', '..', 'protocol', 'proto', 'runner.proto'),
    resolve(here, '..', '..', '..', '..', 'protocol', 'proto', 'runner.proto'),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error(`runner.proto not found. checked: ${candidates.join(', ')}`);
}
