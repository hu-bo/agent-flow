import { describe, expect, it } from 'vitest';
import { ToolRegistry, validateAgainstSchema } from '@agent-flow/core';
import type { RunnerDispatchService } from '../src/services/runner-dispatch-service.js';
import { registerRunnerBackedTools } from '../src/services/runner-backed-tools.js';
import { isReadOnlyShellExec } from '../src/services/runner-command-policy.js';

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

  it('treats pwd/whoami/echo inspection chains as read-only shell commands', () => {
    expect(
      isReadOnlyShellExec({
        command: 'pwd',
        args: ['&&', 'whoami', '&&', 'echo', 'OK'],
      }),
    ).toBe(true);
  });
});
