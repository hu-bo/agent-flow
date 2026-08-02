import { describe, expect, it } from 'vitest';
import { ToolRegistry, validateAgainstSchema } from '@agent-flow/core';
import type { RunnerDispatchService } from '../src/services/runner-dispatch-service.js';
import { registerRunnerBackedTools } from '../src/services/runner-backed-tools.js';

describe('Runner-backed tool catalog', () => {
  it('accepts the integer limits emitted for fs.list', () => {
    const registry = new ToolRegistry();
    registerRunnerBackedTools(registry, {} as RunnerDispatchService);

    const inputSchema = registry.get('fs.list')?.schema.input;
    expect(inputSchema?.properties?.maxEntries?.type).toBe('integer');
    expect(() =>
      validateAgainstSchema(
        {
          path: '.',
          recursive: false,
          maxEntries: 200,
          includeHidden: false,
        },
        inputSchema!,
      ),
    ).not.toThrow();
  });
});
