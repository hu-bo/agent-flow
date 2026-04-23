import { SessionManager, FileRemoteSessionManager } from '@agent-flow/core/store';
import { LocalCheckpointManager } from '@agent-flow/core/checkpoint';
import type { TaskState } from '@agent-flow/core/checkpoint';
import { PermissionManager, ToolRegistry } from '@agent-flow/core';
import type { ServerConfig } from './config.js';

export interface ServerRuntime {
  config: ServerConfig;
  sessionManager: SessionManager;
  remoteSessionManager: FileRemoteSessionManager;
  checkpointManager: LocalCheckpointManager;
  toolRegistry: ToolRegistry;
  permissionManager: PermissionManager;
  tasks: Map<string, TaskState>;
}

export function createServerRuntime(config: ServerConfig): ServerRuntime {
  return {
    config,
    sessionManager: new SessionManager(config.sessionDir),
    remoteSessionManager: new FileRemoteSessionManager({ basePath: config.sessionDir }),
    checkpointManager: new LocalCheckpointManager(config.checkpointDir),
    toolRegistry: new ToolRegistry(),
    permissionManager: new PermissionManager(),
    tasks: new Map<string, TaskState>(),
  };
}


