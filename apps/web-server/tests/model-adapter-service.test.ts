import { describe, expect, it } from 'vitest';
import {
  readGenerationMode,
  readProviderMetadataString,
} from '../src/services/model-adapter-service.js';

describe('readProviderMetadataString', () => {
  it('reads provider metadata from the top level first', () => {
    expect(
      readProviderMetadataString(
        {
          apiVersion: '2024-10-21',
          config: {
            apiVersion: '2024-02-01',
          },
        },
        'apiVersion',
      ),
    ).toBe('2024-10-21');
  });

  it('falls back to nested config metadata for legacy console payloads', () => {
    expect(
      readProviderMetadataString(
        {
          config: {
            apiVersion: '2024-02-01',
          },
        },
        'apiVersion',
      ),
    ).toBe('2024-02-01');
  });
});

describe('readGenerationMode', () => {
  it('supports generationMode stored in nested config metadata', () => {
    expect(
      readGenerationMode({
        config: {
          generationMode: 'nonstream',
        },
      }),
    ).toBe('nonstream');
  });
});
