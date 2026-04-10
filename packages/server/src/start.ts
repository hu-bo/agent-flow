#!/usr/bin/env node

import { ModelGateway } from '@agent-flow/model-gateway';
import { AiSdkAdapter } from '@agent-flow/model-adapter-ai-sdk';
import { AgentFlowServer } from './index';
import type { LanguageModel } from 'ai';

async function main() {
  let port = 3000;
  let staticDir: string | undefined;
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port') port = parseInt(args[++i], 10);
    if (args[i] === '--static-dir') staticDir = args[++i];
  }

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
