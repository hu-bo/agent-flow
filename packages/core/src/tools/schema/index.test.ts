import { describe, expect, it } from 'vitest';
import type { JsonSchema } from '../../types/index.js';
import { validateAgainstSchema } from './index.js';

const scanInputSchema: JsonSchema = {
  type: 'object',
  properties: {
    maxEntries: { type: 'integer' },
  },
};

describe('validateAgainstSchema', () => {
  it('accepts integer values emitted by Zod JSON Schema', () => {
    expect(() => validateAgainstSchema({ maxEntries: 200 }, scanInputSchema)).not.toThrow();
  });

  it('rejects non-integer values with the property pointer', () => {
    expect(() => validateAgainstSchema({ maxEntries: 1.5 }, scanInputSchema)).toThrow(
      'Schema validation failed at "$.maxEntries": expected integer.',
    );
    expect(() => validateAgainstSchema({ maxEntries: '200' }, scanInputSchema)).toThrow(
      'Schema validation failed at "$.maxEntries": expected integer.',
    );
  });
});
