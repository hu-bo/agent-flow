import { z } from 'zod';

export const healthResponseSchema = z.object({
  status: z.string(),
  model: z.string(),
  service: z.string(),
  uptimeSec: z.number(),
  timestamp: z.string(),
});
