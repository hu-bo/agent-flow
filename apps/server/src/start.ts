#!/usr/bin/env node

import { ModelGateway } from '@agent-flow/model-gateway';
import { AiSdkAdapter } from '@agent-flow/model-adapter-ai-sdk';
import { AgentFlowServer } from './index.js';
import type { LanguageModel } from 'ai';
import { HttpError } from './errors.js';

interface CliOptions {
  port: number;
  staticDir?: string;
}

function parseCliOptions(argv: string[]): CliOptions {
  let port = 3000;
  let staticDir: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--port') {
      const raw = argv[++i];
      const parsed = Number.parseInt(raw ?? '', 10);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new HttpError(400, `Invalid --port value: ${raw}`, 'INVALID_PORT');
      }
      port = parsed;
      continue;
    }

    if (arg === '--static-dir') {
      staticDir = argv[++i];
      continue;
    }
  }

  return { port, staticDir };
}

async function main() {
  const { port, staticDir } = parseCliOptions(process.argv.slice(2));

  const modelId = process.env.AGENT_FLOW_MODEL ?? 'gpt-4o';

  // Create gateway and register adapter
  const gateway = new ModelGateway({ defaultModel: modelId });

  let providerId = 'openai';
  if (modelId.startsWith('claude')) providerId = 'anthropic';
  else if (modelId.startsWith('gemini')) providerId = 'google';
  else if (modelId.startsWith('deepseek')) providerId = 'deepseek';

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
    console.error(`Cannot create language model for: ${modelId}`);
    process.exit(1);
  }

  const adapter = new AiSdkAdapter(languageModel as LanguageModel, providerId);
  gateway.registerAdapter(modelId, adapter);

  const server = new AgentFlowServer({
    port,
    gateway,
    sessionDir: process.env.AGENT_FLOW_SESSIONS ?? '.agent-flow/sessions',
    checkpointDir: process.env.AGENT_FLOW_CHECKPOINTS ?? '.agent-flow/checkpoints',
    corsOrigins: ['http://localhost:5173', 'http://localhost:5174'],
    staticDir,
  });

  await server.start();
}

main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

