import * as http from 'http';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import * as crypto from 'crypto';
import type { UnifiedMessage, StreamChunk } from '@agent-flow/model-contracts';
import { ModelGateway } from '@agent-flow/model-gateway';
import { ContextStore, SessionManager } from '@agent-flow/context-store';
import { ContextCompressor } from '@agent-flow/context-compressor';
import { LocalCheckpointManager, TaskStateMachine } from '@agent-flow/checkpoint';
import type { TaskState } from '@agent-flow/checkpoint';
import { Agent, QueryEngine, ToolRegistry, PermissionManager } from '@agent-flow/core';
import type { AgentConfig } from '@agent-flow/core';

export interface ServerConfig {
  port: number;
  host?: string;
  gateway: ModelGateway;
  sessionDir: string;
  checkpointDir: string;
  corsOrigins?: string[];
  /** Path to static files directory (e.g. playground dist/) to serve in production */
  staticDir?: string;
}

export class AgentFlowServer {
  private app: express.Application;
  private server: http.Server | null = null;
  private wss: WebSocketServer | null = null;
  private config: ServerConfig;
  private sessionManager: SessionManager;
  private checkpointManager: LocalCheckpointManager;
  private toolRegistry: ToolRegistry;
  private permissionManager: PermissionManager;
  private tasks = new Map<string, TaskState>();

  constructor(config: ServerConfig) {
    this.config = config;
    this.sessionManager = new SessionManager(config.sessionDir);
    this.checkpointManager = new LocalCheckpointManager(config.checkpointDir);
    this.toolRegistry = new ToolRegistry();
    this.permissionManager = new PermissionManager();
    this.app = this.createApp();
  }

  private createApp(): express.Application {
    const app = express();
    app.use(express.json());

    // CORS
    app.use((_req: express.Request, res: express.Response, next: express.NextFunction) => {
      const origins = this.config.corsOrigins ?? ['*'];
      res.header('Access-Control-Allow-Origin', origins.join(','));
      res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      next();
    });

    // Routes
    app.post('/api/chat', this.handleChat.bind(this));
    app.get('/api/sessions', this.handleListSessions.bind(this));
    app.post('/api/sessions', this.handleCreateSession.bind(this));
    app.delete('/api/sessions/:id', this.handleDeleteSession.bind(this));
    app.post('/api/tasks', this.handleCreateTask.bind(this));
    app.get('/api/tasks/:id', this.handleGetTask.bind(this));
    app.post('/api/compact', this.handleCompact.bind(this));
    app.post('/api/model', this.handleSwitchModel.bind(this));
    app.get('/api/health', (_req: express.Request, res: express.Response) => {
      res.json({ status: 'ok', model: this.config.gateway.resolveModel() });
    });

    // Static file serving (production mode)
    if (this.config.staticDir) {
      app.use(express.static(this.config.staticDir));
      // SPA fallback: serve index.html for non-API routes
      app.get('*', (_req: express.Request, res: express.Response) => {
        res.sendFile('index.html', { root: this.config.staticDir! });
      });
    }

    // Error handler
    app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error('Server error:', err);
      res.status(500).json({ error: err.message });
    });

    return app;
  }

  private async handleChat(req: express.Request, res: express.Response): Promise<void> {
    const { message, model, sessionId, stream } = req.body as {
      message: string;
      model?: string;
      sessionId?: string;
      stream?: boolean;
    };

    if (!message) {
      res.status(400).json({ error: 'message is required' });
      return;
    }

    const contextStore = new ContextStore();
    const adapter = this.config.gateway.getAdapter(model);
    const compressor = new ContextCompressor(adapter);
    const queryEngine = new QueryEngine(this.config.gateway, contextStore, compressor);

    const agentConfig: AgentConfig = {
      modelId: model ?? this.config.gateway.resolveModel(),
    };

    const agent = new Agent(queryEngine, agentConfig, {
      contextStore,
      toolRegistry: this.toolRegistry,
      compressor,
      checkpointManager: this.checkpointManager,
      permissionManager: this.permissionManager,
    });

    if (stream) {
      // SSE streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      try {
        for await (const msg of agent.run(message)) {
          res.write(`data: ${JSON.stringify(msg)}\n\n`);
        }
        res.write('data: [DONE]\n\n');
      } catch (error) {
        res.write(`data: ${JSON.stringify({ error: (error as Error).message })}\n\n`);
      }
      res.end();
    } else {
      // Regular JSON response
      const messages: UnifiedMessage[] = [];
      try {
        for await (const msg of agent.run(message)) {
          messages.push(msg);
        }
        res.json({ messages });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    }
  }

  private async handleListSessions(_req: express.Request, res: express.Response): Promise<void> {
    const sessions = this.sessionManager.listSessions();
    res.json({ sessions });
  }

  private async handleCreateSession(req: express.Request, res: express.Response): Promise<void> {
    const { modelId, systemPrompt } = req.body as { modelId?: string; systemPrompt?: string };
    const session = this.sessionManager.createSession({
      modelId: modelId ?? this.config.gateway.resolveModel(),
      cwd: process.cwd(),
      systemPrompt,
    });
    res.status(201).json({ session });
  }

  private async handleDeleteSession(req: express.Request<{ id: string }>, res: express.Response): Promise<void> {
    this.sessionManager.deleteSession(req.params.id);
    res.status(204).end();
  }

  private async handleCreateTask(req: express.Request, res: express.Response): Promise<void> {
    const { message, model } = req.body as { message: string; model?: string };
    if (!message) {
      res.status(400).json({ error: 'message is required' });
      return;
    }

    const taskId = crypto.randomUUID();
    const sessionId = crypto.randomUUID();
    const state = TaskStateMachine.createInitial(taskId, sessionId);
    this.tasks.set(taskId, state);

    // Start task in background
    this.runTaskInBackground(taskId, message, model).catch(err => {
      const current = this.tasks.get(taskId);
      if (current) {
        this.tasks.set(taskId, TaskStateMachine.transition(current, 'fail'));
      }
    });

    res.status(202).json({ taskId, status: state.status });
  }

  private async handleGetTask(req: express.Request<{ id: string }>, res: express.Response): Promise<void> {
    const state = this.tasks.get(req.params.id);
    if (!state) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json(state);
  }

  private async handleCompact(req: express.Request, res: express.Response): Promise<void> {
    const { sessionId, trigger } = req.body as { sessionId?: string; trigger?: 'manual' | 'auto' };

    if (!sessionId) {
      res.status(400).json({ error: 'sessionId is required' });
      return;
    }

    try {
      const session = this.sessionManager.loadSession(sessionId);
      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      const adapter = this.config.gateway.getAdapter();
      const compressor = new ContextCompressor(adapter);
      const result = await compressor.compact(session.messages, { trigger: trigger ?? 'manual' });

      // Persist compacted messages back to session
      for (const msg of result.messages) {
        this.sessionManager.appendMessage(sessionId, msg, process.cwd());
      }

      res.json({
        sessionId,
        stats: result.stats,
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  private async handleSwitchModel(req: express.Request, res: express.Response): Promise<void> {
    const { modelId } = req.body as { modelId: string };
    if (!modelId) {
      res.status(400).json({ error: 'modelId is required' });
      return;
    }
    this.config.gateway.switchModel(modelId);
    res.json({ model: modelId });
  }

  private async runTaskInBackground(taskId: string, message: string, model?: string): Promise<void> {
    const state = this.tasks.get(taskId)!;
    this.tasks.set(taskId, TaskStateMachine.transition(state, 'start'));

    const contextStore = new ContextStore();
    const adapter = this.config.gateway.getAdapter(model);
    const compressor = new ContextCompressor(adapter);
    const queryEngine = new QueryEngine(this.config.gateway, contextStore, compressor);

    const agent = new Agent(queryEngine, {
      modelId: model ?? this.config.gateway.resolveModel(),
    }, {
      contextStore,
      toolRegistry: this.toolRegistry,
      compressor,
      checkpointManager: this.checkpointManager,
      permissionManager: this.permissionManager,
    });

    try {
      for await (const _msg of agent.run(message)) {
        // Process messages (could store them, emit via WebSocket, etc.)
      }
      const current = this.tasks.get(taskId)!;
      this.tasks.set(taskId, TaskStateMachine.transition(current, 'complete'));
    } catch (error) {
      const current = this.tasks.get(taskId)!;
      const failed = TaskStateMachine.transition(current, 'fail');
      failed.error = {
        code: 'TASK_ERROR',
        message: (error as Error).message,
        retryable: true,
      };
      this.tasks.set(taskId, failed);
    }
  }

  private setupWebSocket(server: http.Server): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      ws.on('message', async (data: Buffer) => {
        try {
          const { type, message, model } = JSON.parse(data.toString()) as {
            type: string;
            message?: string;
            model?: string;
          };

          if (type === 'chat' && message) {
            const contextStore = new ContextStore();
            const adapter = this.config.gateway.getAdapter(model);
            const compressor = new ContextCompressor(adapter);
            const queryEngine = new QueryEngine(this.config.gateway, contextStore, compressor);

            const agent = new Agent(queryEngine, {
              modelId: model ?? this.config.gateway.resolveModel(),
            }, {
              contextStore,
              toolRegistry: this.toolRegistry,
              compressor,
              checkpointManager: this.checkpointManager,
              permissionManager: this.permissionManager,
            });

            for await (const msg of agent.run(message)) {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'message', data: msg }));
              }
            }

            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'done' }));
            }
          }
        } catch (error) {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'error', error: (error as Error).message }));
          }
        }
      });
    });
  }

  async start(): Promise<void> {
    const { port, host } = this.config;
    this.server = http.createServer(this.app);
    this.setupWebSocket(this.server);

    return new Promise((resolve) => {
      this.server!.listen(port, host ?? '0.0.0.0', () => {
        console.log(`agent-flow server listening on ${host ?? '0.0.0.0'}:${port}`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
    if (this.server) {
      return new Promise((resolve) => {
        this.server!.close(() => resolve());
        this.server = null;
      });
    }
  }

  getToolRegistry(): ToolRegistry {
    return this.toolRegistry;
  }
}
