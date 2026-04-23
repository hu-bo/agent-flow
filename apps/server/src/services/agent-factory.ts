import { ContextStore } from '@agent-flow/core/store';
import { ContextCompressor } from '@agent-flow/core/compressor';
import { Agent, QueryEngine } from '@agent-flow/core';
import type { UnifiedMessage } from '@agent-flow/core/messages';
import type { ServerRuntime } from '../runtime.js';

export interface CreateAgentOptions {
  model?: string;
  reasoningEffort?: 'low' | 'medium' | 'high';
  systemPrompt?: string;
  seedMessages?: UnifiedMessage[];
}

function mapReasoningTemperature(effort?: 'low' | 'medium' | 'high'): number | undefined {
  if (!effort) return undefined;
  if (effort === 'low') return 0.2;
  if (effort === 'high') return 0.7;
  return 0.4;
}

export function createAgent(runtime: ServerRuntime, options: CreateAgentOptions = {}): {
  agent: Agent;
  contextStore: ContextStore;
} {
  const contextStore = new ContextStore();
  if (options.seedMessages?.length) {
    contextStore.appendMessages(options.seedMessages);
  }

  const adapter = runtime.config.gateway.getAdapter(options.model);
  const compressor = new ContextCompressor(adapter);
  const queryEngine = new QueryEngine(
    runtime.config.gateway,
    contextStore,
    compressor,
    {
      systemPrompt: options.systemPrompt,
      temperature: mapReasoningTemperature(options.reasoningEffort),
    },
  );

  const agent = new Agent(
    queryEngine,
    {
      modelId: options.model ?? runtime.config.gateway.resolveModel(),
      systemPrompt: options.systemPrompt,
    },
    {
      contextStore,
      toolRegistry: runtime.toolRegistry,
      compressor,
      checkpointManager: runtime.checkpointManager,
      permissionManager: runtime.permissionManager,
    },
  );

  return { agent, contextStore };
}

