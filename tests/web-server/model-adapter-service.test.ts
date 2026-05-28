import { describe, expect, it } from 'vitest';
import {
  readGenerationMode,
  resolveOpenAiCompatibility,
} from '../../apps/web-server/src/services/model-adapter-service.js';

describe('resolveOpenAiCompatibility', () => {
  it('returns strict for official OpenAI without baseURL override', () => {
    expect(resolveOpenAiCompatibility('openai', undefined)).toBe('strict');
  });

  it('returns strict for official OpenAI host', () => {
    expect(resolveOpenAiCompatibility('openai', 'https://api.openai.com/v1')).toBe('strict');
  });

  it('returns compatible for third-party OpenAI-compatible hosts', () => {
    expect(resolveOpenAiCompatibility('openai', 'https://api.aigcdesk.com/v1')).toBe('compatible');
  });

  it('returns compatible for non-openai provider types', () => {
    expect(resolveOpenAiCompatibility('anthropic', 'https://api.openai.com/v1')).toBe('compatible');
  });

  it('returns compatible for invalid baseURL strings', () => {
    expect(resolveOpenAiCompatibility('openai', 'not-a-valid-url')).toBe('compatible');
  });
});

describe('readGenerationMode', () => {
  it('defaults provider generation to stream aggregation', () => {
    expect(readGenerationMode(null)).toBe('stream');
    expect(readGenerationMode({})).toBe('stream');
  });

  it('uses nonstream only when explicitly configured', () => {
    expect(readGenerationMode({ generationMode: 'nonstream' })).toBe('nonstream');
  });

  it('treats unknown generation modes as stream', () => {
    expect(readGenerationMode({ generationMode: 'auto' })).toBe('stream');
  });
});
