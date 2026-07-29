import { createAnthropicAdapter } from '@agent-flow/model-adapters/anthropic';
import type { AiSdkGenerationMode } from '@agent-flow/model-adapters/ai-sdk';
import { createDeepSeekAdapter } from '@agent-flow/model-adapters/deepseek';
import { createMiniMaxAdapter } from '@agent-flow/model-adapters/minimax';
import { createOpenAiAdapter } from '@agent-flow/model-adapters/openai';
import type { ModelAdapter } from '@agent-flow/model-adapters/types';
import type { AppDataSource } from '../db/data-source.js';
import { ProviderCredentialEntity } from '../db/entities/provider-credential.entity.js';
import { ProviderModelEntity } from '../db/entities/provider-model.entity.js';
import { NotFoundError } from '../lib/errors.js';

export class ModelAdapterService {
  constructor(private readonly db: AppDataSource) {}

  async createAdapter(modelId: number): Promise<ModelAdapter> {
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
      throw new NotFoundError(`Unknown or inactive model: ${modelId}`);
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
    const generationMode = readGenerationMode(model.provider.metadata);
    const providerType = model.provider.type.toLowerCase();
    const providerName = model.provider.name;

    if (providerType === 'anthropic') {
      return createAnthropicAdapter({
        model: model.model,
        providerId: providerName,
        apiKey,
        generationMode,
        ...(baseURL ? { baseURL } : {}),
      });
    }

    if (providerType === 'deepseek') {
      return createDeepSeekAdapter({
        model: model.model,
        providerId: providerName,
        apiKey,
        generationMode,
        ...(baseURL ? { baseURL } : {}),
      });
    }

    if (providerType === 'minimax') {
      return createMiniMaxAdapter({
        model: model.model,
        providerId: providerName,
        apiKey,
        generationMode,
        ...(baseURL ? { baseURL } : {}),
      });
    }

    return createOpenAiAdapter({
      model: model.model,
      providerId: providerName,
      apiKey,
      generationMode,
      compatibility: resolveOpenAiCompatibility(providerType, baseURL),
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

export function readGenerationMode(metadata: Record<string, unknown> | null): AiSdkGenerationMode {
  const value = readMetadataString(metadata, 'generationMode');
  if (value === 'nonstream') {
    return 'nonstream';
  }
  return 'stream';
}

export function resolveOpenAiCompatibility(
  providerType: string,
  baseURL: string | undefined,
): 'strict' | 'compatible' {
  if (providerType !== 'openai') {
    return 'compatible';
  }

  if (!baseURL) {
    // No override means default OpenAI endpoint.
    return 'strict';
  }

  const host = tryReadHostname(baseURL);
  if (host === 'api.openai.com') {
    return 'strict';
  }

  return 'compatible';
}

function tryReadHostname(baseURL: string): string | undefined {
  try {
    return new URL(baseURL).hostname.toLowerCase();
  } catch {
    return undefined;
  }
}
