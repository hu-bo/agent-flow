import { z } from 'zod';
import { modelIdSchema } from './common.js';

export const modelDescriptorSchema = z.object({
  modelId: modelIdSchema,
  displayName: z.string(),
  provider: z.string(),
  maxInputTokens: z.number().int().positive(),
});

export const switchModelBodySchema = z.object({
  modelId: modelIdSchema,
});
