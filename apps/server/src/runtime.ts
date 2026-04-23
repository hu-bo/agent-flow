import { SessionManager } from '@agent-flow/context-store';
import { LocalCheckpointManager } from '@agent-flow/checkpoint';
import type { TaskState } from '@agent-flow/checkpoint';
import { PermissionManager, ToolRegistry } from '@agent-flow/core';
import type { ServerConfig } from './config.js';

export interface ServerRuntime {
  config: ServerConfig;
  sessionManager: SessionManager;
  checkpointManager: LocalCheckpointManager;
  toolRegistry: ToolRegistry;
  permissionManager: PermissionManager;
  tasks: Map<string, TaskState>;
}

export function createServerRuntime(config: ServerConfig): ServerRuntime {
  return {
    config,
    sessionManager: new SessionManager(config.sessionDir),
    checkpointManager: new LocalCheckpointManager(config.checkpointDir),
    toolRegistry: new ToolRegistry(),
    permissionManager: new PermissionManager(),
    tasks: new Map<string, TaskState>(),
  };
}

