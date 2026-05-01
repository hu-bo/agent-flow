import { createAnthropicAdapter } from '@agent-flow/model-adapters/anthropic';
import { createOpenAiAdapter } from '@agent-flow/model-adapters/openai';
import type { ModelAdapter } from '@agent-flow/model-adapters/types';
import type { AppDataSource } from '../db/data-source.js';
import { ProviderCredentialEntity } from '../db/entities/provider-credential.entity.js';
import { ProviderModelEntity } from '../db/entities/provider-model.entity.js';
import { NotFoundError } from '../lib/errors.js';

export class ModelAdapterService {
  constructor(private readonly db: AppDataSource) {}

  async createAdapter(modelId: string): Promise<ModelAdapter> {
    const modelRepository = this.db.getRepository(ProviderModelEntity);
    const model = await modelRepository.findOne({
      where: {
        modelId,
        status: 'active',
      },
      relations: {
        provider: true,
      },
    });

    if (!model || model.provider.status !== 'active') {
      return createFallbackAdapter(modelId);
    }

    const credentialRepository = this.db.getRepository(ProviderCredentialEntity);
    const credential = await credentialRepository.findOne({
      where: {
        providerId: model.providerId,
        status: 'active',
      },
      order: {
        keyVersion: 'DESC',
      },
    });

    const apiKey = credential?.secretRef?.trim();
    if (!apiKey) {
      throw new Error(`Provider "${model.provider.name}" has no active credential.`);
    }

    const baseURL = readMetadataString(model.provider.metadata, 'baseUrl');
    const providerType = model.provider.type.toLowerCase();
    const providerName = model.provider.name;
    const upstreamModelId = model.upstreamModelId?.trim() || model.modelId;

    if (providerType === 'anthropic') {
      return createAnthropicAdapter({
        model: upstreamModelId,
        providerId: providerName,
        apiKey,
        ...(baseURL ? { baseURL } : {}),
      });
    }

    return createOpenAiAdapter({
      model: upstreamModelId,
      providerId: providerName,
      apiKey,
      compatibility: providerType === 'openai' ? 'strict' : 'compatible',
      ...(baseURL ? { baseURL } : {}),
    });
  }
}

function readMetadataString(metadata: Record<string, unknown> | null, key: string): string | undefined {
  const value = metadata?.[key];
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function createFallbackAdapter(modelId: string): ModelAdapter {
  const providerType = inferProviderType(modelId);
  if (providerType === 'anthropic') {
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey) {
      throw new NotFoundError(`Unknown or inactive model: ${modelId}`);
    }
    const baseURL = process.env.ANTHROPIC_BASE_URL?.trim() || process.env.ANTHROPIC_BASEURL?.trim();
    return createAnthropicAdapter({
      model: modelId,
      apiKey,
      ...(baseURL ? { baseURL } : {}),
    });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new NotFoundError(`Unknown or inactive model: ${modelId}`);
  }
  const baseURL =
    process.env.OPENAI_BASE_URL?.trim() ||
    process.env.OPENAI_BASEURL?.trim() ||
    process.env.AGENT_FLOW_OPENAI_BASE_URL?.trim();
  return createOpenAiAdapter({
    model: modelId,
    apiKey,
    compatibility: providerType === 'openai' ? 'strict' : 'compatible',
    ...(baseURL ? { baseURL } : {}),
  });
}

function inferProviderType(modelId: string): 'openai' | 'anthropic' | 'custom' {
  if (modelId.startsWith('claude-')) {
    return 'anthropic';
  }
  if (modelId.startsWith('gpt-') || modelId.startsWith('o1') || modelId.startsWith('o3')) {
    return 'openai';
  }
  return 'custom';
}
