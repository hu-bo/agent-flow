import type {
  ToolCall,
  ToolContext,
  ToolExecuteOptions,
  ToolExecutorLike,
  ToolRegistryLike,
  ToolResult
} from '../../types/index.js';
import { validateAgainstSchema } from '../schema/index.js';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export class ToolExecutor implements ToolExecutorLike {
  constructor(private readonly registry: ToolRegistryLike) {}

  async execute(call: ToolCall, context: ToolContext, options: ToolExecuteOptions = {}): Promise<ToolResult> {
    const tool = this.registry.get(call.name);
    if (!tool) {
      return {
        name: call.name,
        ok: false,
        error: `Tool "${call.name}" not found.`
      };
    }

    validateAgainstSchema(call.input, tool.schema.input);

    const retries = options.retries ?? 0;
    const retryDelayMs = options.retryDelayMs ?? 200;
    let attempt = 0;

    while (attempt <= retries) {
      try {
        const output = await tool.execute(call.input, context);
        if (tool.schema.output) {
          validateAgainstSchema(output, tool.schema.output);
        }
        return {
          name: call.name,
          ok: true,
          output
        };
      } catch (error) {
        attempt += 1;
        if (attempt > retries) {
          return {
            name: call.name,
            ok: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
        await sleep(retryDelayMs);
      }
    }

    return {
      name: call.name,
      ok: false,
      error: 'Unexpected tool execution state.'
    };
  }
}
