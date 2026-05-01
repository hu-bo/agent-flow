import { z } from 'zod';
import { modelIdSchema } from './common.js';

export const modelDescriptorSchema = z.object({
  modelId: modelIdSchema,
  model: z.string(),
  displayName: z.string(),
  provider: z.string(),
  providerType: z.string(),
  providerModel: z.string(),
  maxInputTokens: z.number().int().positive(),
});

export const switchModelBodySchema = z.object({
  modelId: modelIdSchema,
});
