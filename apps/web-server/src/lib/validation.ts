import { z } from 'zod';
import { ValidationError } from './errors.js';

export function parseWithSchema<T>(
  schema: z.ZodType<T>,
  value: unknown,
  source: 'body' | 'params' | 'query',
): T {
  const result = schema.safeParse(value);
  if (result.success) {
    return result.data;
  }

  throw new ValidationError(`Invalid ${source}`, result.error.flatten());
}
