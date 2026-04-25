import { z } from 'zod';
import { sessionIdSchema } from './common.js';

export const compactBodySchema = z.object({
  sessionId: sessionIdSchema.optional(),
  trigger: z.enum(['auto', 'manual', 'model-switch']).default('manual'),
});
