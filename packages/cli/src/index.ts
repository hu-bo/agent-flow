#!/usr/bin/env node

import * as readline from 'readline';
import * as path from 'path';
import { spawn, execSync, type ChildProcess } from 'child_process';
import { fileURLToPath } from 'url';
import { ModelGateway } from '@agent-flow/model-gateway';
import { AiSdkAdapter } from '@agent-flow/model-adapter-ai-sdk';
import { ContextStore } from '@agent-flow/context-store';
import { SessionManager } from '@agent-flow/context-store';
import { ContextCompressor } from '@agent-flow/context-compressor';
import { LocalCheckpointManager } from '@agent-flow/checkpoint';
import { Agent } from '@agent-flow/core';
import { QueryEngine } from '@agent-flow/core';
import { ToolRegistry } from '@agent-flow/core';
import { PermissionManager } from '@agent-flow/core';
import type { UnifiedMessage } from '@agent-flow/model-contracts';
import type { LanguageModel } from 'ai';

interface CliOptions {
  model: string;
  resume?: string;
  sessionDir: string;
  checkpointDir: string;
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    model: process.env.AGENT_FLOW_MODEL ?? 'gpt-4o',
    sessionDir: process.env.AGENT_FLOW_SESSIONS ?? '.agent-flow/sessions',
    checkpointDir: process.env.AGENT_FLOW_CHECKPOINTS ?? '.agent-flow/checkpoints',
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--model':
      case '-m':
        options.model = args[++i];
        break;
      case '--resume':
      case '-r':
        options.resume = args[++i] ?? 'latest';
        break;
      case '--session-dir':
        options.sessionDir = args[++i];
        break;
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
agent-flow — AI Agent CLI

Usage:
  agent-flow [options] [prompt]
  agent-flow playground [options]

Options:
  --model, -m <id>     Model to use (default: gpt-4o)
  --resume, -r [id]    Resume a previous session
  --session-dir <dir>  Session storage directory

Playground options:
  --port <port>        Server port (default: 3000)
  --production, --prod Build and serve static files (single process, no Vite dev server)
  --no-open            Don't open browser

Commands (in chat):
  /model <id>          Switch model
  /compact             Trigger context compression
  /sessions            List sessions
  /tools               List registered tools
  /help                Show this help
  /quit                Exit

Environment:
  AGENT_FLOW_MODEL     Default model
  OPENAI_API_KEY       OpenAI API key
  ANTHROPIC_API_KEY    Anthropic API key
`);
}

async function createAdapter(modelId: string): Promise<{ adapter: AiSdkAdapter; providerId: string }> {
  // Determine provider from model ID
  let providerId = 'openai';
  if (modelId.startsWith('claude')) providerId = 'anthropic';
  else if (modelId.startsWith('gemini')) providerId = 'google';
  else if (modelId.startsWith('deepseek')) providerId = 'deepseek';

  // Dynamic import to get the language model
  let languageModel: unknown;
  if (providerId === 'openai' || providerId === 'deepseek') {
    const { createOpenAI } = await import('@ai-sdk/openai');
    const config: Record<string, unknown> = {};
    if (providerId === 'deepseek') {
      config.baseURL = 'https://api.deepseek.com/v1';
      config.apiKey = process.env.DEEPSEEK_API_KEY;
    }
    const provider = createOpenAI(config as Parameters<typeof createOpenAI>[0]);
    languageModel = provider(modelId);
  } else if (providerId === 'anthropic') {
    const { createAnthropic } = await import('@ai-sdk/anthropic');
    const provider = createAnthropic({});
    languageModel = provider(modelId);
  }

  if (!languageModel) {
    throw new Error(`Cannot create language model for: ${modelId}`);
  }

  const adapter = new AiSdkAdapter(languageModel as LanguageModel, providerId);
  return { adapter, providerId };
}

function formatMessage(message: UnifiedMessage): string {
  const parts: string[] = [];
  for (const part of message.content) {
    switch (part.type) {
      case 'text':
        parts.push(part.text);
        break;
      case 'tool-call':
        parts.push(`[Calling tool: ${part.toolName}]`);
        break;
      case 'tool-result':
        parts.push(`[Tool ${part.toolName}: ${part.isError ? 'ERROR' : 'OK'}]`);
        break;
    }
  }
  return parts.join('\n');
}

// Command definitions for completer and hint display
const COMMANDS: Array<{ name: string; description: string; args?: string }> = [
  { name: '/model', description: 'Switch model', args: '<id>' },
  { name: '/compact', description: 'Trigger context compression' },
  { name: '/sessions', description: 'List sessions' },
  { name: '/tools', description: 'List registered tools' },
  { name: '/help', description: 'Show help' },
  { name: '/quit', description: 'Exit' },
];

const COMMAND_NAMES = COMMANDS.map(c => c.name);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function completer(line: string): [string[], string] {
  if (line.startsWith('/')) {
    const hits = COMMAND_NAMES.filter(c => c.startsWith(line));
    return [hits.length ? hits : COMMAND_NAMES, line];
  }
  return [[], line];
}

function printCommandHints(): void {
  console.log('\nAvailable commands:');
  for (const cmd of COMMANDS) {
    const usage = cmd.args ? `${cmd.name} ${cmd.args}` : cmd.name;
    console.log(`  ${usage.padEnd(20)} ${cmd.description}`);
  }
  console.log('');
}

async function runPlayground(args: string[]): Promise<void> {
  let port = 3000;
  let openBrowser = true;
  let production = false;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--port':
        port = parseInt(args[++i], 10);
        break;
      case '--no-open':
        openBrowser = false;
        break;
      case '--production':
      case '--prod':
        production = true;
        break;
    }
  }

  // Resolve paths relative to this package (cli) → monorepo root
  const cliDir = path.resolve(__dirname, '..');
  const monorepoRoot = path.resolve(cliDir, '../..');
  const serverDir = path.join(monorepoRoot, 'packages/server');
  const playgroundDir = path.join(monorepoRoot, 'apps/playground');
  const playgroundDist = path.join(playgroundDir, 'dist');

  const children: ChildProcess[] = [];

  function cleanup() {
    for (const child of children) {
      child.kill();
    }
  }

  process.on('SIGINT', () => { cleanup(); process.exit(0); });
  process.on('SIGTERM', () => { cleanup(); process.exit(0); });

  if (production) {
    // Build playground
    console.log('Building playground...');
    try {
      execSync('pnpm build', { cwd: playgroundDir, stdio: 'inherit' });
    } catch {
      console.error('Playground build failed.');
      process.exit(1);
    }
    console.log('Playground built successfully.\n');

    // Start server with static file serving
    console.log('Starting agent-flow server (production)...');
    const serverProc = spawn('npx', [
      'tsx', 'src/start.ts',
      '--port', String(port),
      '--static-dir', playgroundDist,
    ], {
      cwd: serverDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    });
    children.push(serverProc);

    serverProc.stdout!.on('data', (data: Buffer) => process.stdout.write(data));
    serverProc.stderr!.on('data', (data: Buffer) => process.stderr.write(data));
    serverProc.on('exit', (code) => {
      if (code !== null && code !== 0) {
        console.error(`Server exited with code ${code}`);
        cleanup();
        process.exit(1);
      }
    });

    await waitForServer(`http://localhost:${port}/api/health`, 15000);

    const url = `http://localhost:${port}`;
    if (openBrowser) {
      console.log(`Opening ${url} ...`);
      const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
      spawn(cmd, [url], { stdio: 'ignore', detached: true }).unref();
    }

    console.log(`\nPlayground is running at ${url}`);
    console.log('Press Ctrl+C to stop.\n');

    await new Promise(() => {});
  }

  // Development mode
  console.log('Starting agent-flow server...');

  const serverProc = spawn('npx', ['tsx', 'src/start.ts', '--port', String(port)], {
    cwd: serverDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });
  children.push(serverProc);

  serverProc.stdout!.on('data', (data: Buffer) => process.stdout.write(data));
  serverProc.stderr!.on('data', (data: Buffer) => process.stderr.write(data));
  serverProc.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.error(`Server exited with code ${code}`);
      cleanup();
      process.exit(1);
    }
  });

  // Wait for server to be ready
  await waitForServer(`http://localhost:${port}/api/health`, 15000);
  console.log('Server is ready.');

  console.log('Starting playground dev server...');

  // Start Vite dev server for playground
  const viteProc = spawn('npx', ['vite', '--port', '5173'], {
    cwd: playgroundDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });
  children.push(viteProc);

  viteProc.stdout!.on('data', (data: Buffer) => process.stdout.write(data));
  viteProc.stderr!.on('data', (data: Buffer) => process.stderr.write(data));

  // Wait a moment for Vite to start, then open browser
  await new Promise(resolve => setTimeout(resolve, 2000));

  if (openBrowser) {
    const url = 'http://localhost:5173';
    console.log(`Opening ${url} ...`);
    const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    spawn(cmd, [url], { stdio: 'ignore', detached: true }).unref();
  }

  console.log('\nPlayground is running:');
  console.log(`  Server:     http://localhost:${port}`);
  console.log(`  Playground: http://localhost:5173`);
  console.log('\nPress Ctrl+C to stop.\n');

  // Keep alive
  await new Promise(() => {});
}

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error(`Server did not become ready within ${timeoutMs}ms`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  // Subcommand: playground
  if (args[0] === 'playground') {
    await runPlayground(args.slice(1));
    return;
  }

  const options = parseArgs(args);

  // Initialize components
  const gateway = new ModelGateway({ defaultModel: options.model });
  const contextStore = new ContextStore();
  const checkpointManager = new LocalCheckpointManager(options.checkpointDir);
  const toolRegistry = new ToolRegistry();
  const permissionManager = new PermissionManager();

  // Create and register adapter
  try {
    const { adapter } = await createAdapter(options.model);
    gateway.registerAdapter(options.model, adapter);
  } catch (error) {
    console.error(`Failed to initialize model ${options.model}:`, (error as Error).message);
    console.error('Make sure the appropriate API key is set.');
    process.exit(1);
  }

  // Create compressor (uses the same adapter for summarization)
  const compressor = new ContextCompressor(gateway.getAdapter());

  // Create query engine and agent
  const queryEngine = new QueryEngine(gateway, contextStore, compressor);
  const agent = new Agent(queryEngine, { modelId: options.model }, {
    contextStore,
    toolRegistry,
    compressor,
    checkpointManager,
    permissionManager,
  });

  // Resume session if requested
  if (options.resume) {
    const checkpoint = await checkpointManager.loadLatest(options.resume === 'latest' ? 'default' : options.resume);
    if (checkpoint) {
      console.log(`Resumed session from checkpoint: ${checkpoint.checkpointId}`);
    } else {
      console.log('No checkpoint found, starting new session.');
    }
  }

  console.log(`agent-flow v0.1.0 — model: ${options.model}`);
  console.log('Type / for commands, /quit to exit.\n');

  // REPL
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
    completer,
  });

  // Real-time command hints: show suggestions as user types /
  let hintsShown = false;
  readline.emitKeypressEvents(process.stdin, rl);

  process.stdin.on('keypress', () => {
    // Read current line content from readline
    const line = (rl as unknown as { line: string }).line ?? '';

    if (line.startsWith('/') && !hintsShown) {
      hintsShown = true;
      // Print hints below the current line without disrupting input
      const prefix = line;
      const matches = COMMANDS.filter(c => c.name.startsWith(prefix));
      const list = matches.length > 0 ? matches : COMMANDS;

      // Save cursor, move to next line, print hints, restore
      const hint = list
        .map(c => {
          const usage = c.args ? `${c.name} ${c.args}` : c.name;
          return `  \x1b[90m${usage.padEnd(20)} ${c.description}\x1b[0m`;
        })
        .join('\n');

      // Write below current line
      process.stdout.write(`\n${hint}\n`);
      // Redisplay the prompt with current input
      rl.prompt(true);
    } else if (!line.startsWith('/')) {
      hintsShown = false;
    }

    // Refresh hints on further typing within /command
    if (line.startsWith('/') && line.length > 1 && hintsShown) {
      // Update: re-filter on next tick so line is up to date
      setImmediate(() => {
        const currentLine = (rl as unknown as { line: string }).line ?? '';
        if (!currentLine.startsWith('/')) {
          hintsShown = false;
          return;
        }
        const matches = COMMANDS.filter(c => c.name.startsWith(currentLine));
        if (matches.length > 0 && matches.length < COMMANDS.length) {
          const hint = matches
            .map(c => {
              const usage = c.args ? `${c.name} ${c.args}` : c.name;
              return `  \x1b[90m${usage.padEnd(20)} ${c.description}\x1b[0m`;
            })
            .join('\n');
          process.stdout.write(`\n${hint}\n`);
          rl.prompt(true);
        }
      });
    }
  });

  rl.prompt();

  rl.on('line', async (line: string) => {
    hintsShown = false;
    const input = line.trim();
    if (!input) {
      rl.prompt();
      return;
    }

    // Handle commands
    if (input.startsWith('/')) {
      await handleCommand(input, gateway, contextStore, compressor, toolRegistry, options, rl);
      rl.prompt();
      return;
    }

    // Run agent
    try {
      for await (const message of agent.run(input)) {
        if (message.role === 'assistant') {
          const text = formatMessage(message);
          if (text) console.log(`\n${text}\n`);
        } else if (message.role === 'tool') {
          const text = formatMessage(message);
          if (text) console.log(`  ${text}`);
        }
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log('\nGoodbye!');
    process.exit(0);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nSaving checkpoint...');
    rl.close();
  });
}

async function handleCommand(
  input: string,
  gateway: ModelGateway,
  contextStore: ContextStore,
  compressor: ContextCompressor,
  toolRegistry: ToolRegistry,
  options: CliOptions,
  rl: readline.Interface,
): Promise<void> {
  const [cmd, ...args] = input.split(' ');

  switch (cmd) {
    case '/model': {
      const newModel = args[0];
      if (!newModel) {
        console.log(`Current model: ${gateway.resolveModel()}`);
        break;
      }
      try {
        const { adapter } = await createAdapter(newModel);
        gateway.registerAdapter(newModel, adapter);
        gateway.switchModel(newModel);
        console.log(`Switched to model: ${newModel}`);
      } catch (error) {
        console.error(`Failed to switch model:`, (error as Error).message);
      }
      break;
    }

    case '/compact': {
      console.log('Compressing context...');
      try {
        const messages = contextStore.getMessages();
        const result = await compressor.compact(messages, { trigger: 'manual' });
        console.log(`Compressed ${result.stats.summarizedMessageCount} messages. Token reduction: ${result.stats.originalTokenCount} → ${result.stats.compactedTokenCount}`);
      } catch (error) {
        console.error('Compression failed:', (error as Error).message);
      }
      break;
    }

    case '/tools': {
      const tools = toolRegistry.getDefinitions();
      if (tools.length === 0) {
        console.log('No tools registered.');
      } else {
        for (const tool of tools) {
          console.log(`  ${tool.name} — ${tool.description}`);
        }
      }
      break;
    }

    case '/sessions': {
      const sessionManager = new SessionManager(options.sessionDir);
      const sessions = sessionManager.listSessions();
      if (sessions.length === 0) {
        console.log('No sessions found.');
      } else {
        for (const s of sessions) {
          console.log(`  ${s.sessionId} | ${s.modelId} | ${s.messageCount} msgs | ${s.createdAt}`);
        }
      }
      break;
    }

    case '/help':
      printHelp();
      break;

    case '/quit':
    case '/exit':
      rl.close();
      break;

    default:
      console.log(`Unknown command: ${cmd}.`);
      printCommandHints();
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
