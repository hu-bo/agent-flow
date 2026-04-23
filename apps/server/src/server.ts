import { serve } from '@hono/node-server';
import type { ServerType } from '@hono/node-server';
import type { ToolRegistry } from '@agent-flow/core';
import type { ServerConfig } from './config.js';
import { createServerApp } from './http/app.js';
import { createServerRuntime } from './runtime.js';

export class AgentFlowServer {
  private readonly config: ServerConfig;
  private readonly runtime;
  private readonly app;
  private server: ServerType | null = null;

  constructor(config: ServerConfig) {
    this.config = config;
    this.runtime = createServerRuntime(config);
    this.app = createServerApp(this.runtime, config);
  }

  async start(): Promise<void> {
    if (this.server) return;

    const { port, host } = this.config;
    await new Promise<void>((resolve) => {
      this.server = serve(
        {
          fetch: this.app.fetch,
          port,
          hostname: host ?? '0.0.0.0',
        },
        () => {
          console.log(`agent-flow server listening on ${host ?? '0.0.0.0'}:${port}`);
          resolve();
        },
      );
    });
  }

  async stop(): Promise<void> {
    if (!this.server) return;

    const active = this.server;
    this.server = null;
    await new Promise<void>((resolve, reject) => {
      active.close((error?: Error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  getToolRegistry(): ToolRegistry {
    return this.runtime.toolRegistry;
  }
}

