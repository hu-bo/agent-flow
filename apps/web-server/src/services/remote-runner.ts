import type { Runner, RunnerCapabilities, RunnerEvent, RunnerTask } from '@agent-flow/core';
import { RunnerDispatchService } from './runner-dispatch-service.js';

export class RemoteRunner implements Runner {
  readonly id = 'web-remote-runner';
  readonly kind = 'remote' as const;
  readonly capabilities: RunnerCapabilities = {
    streaming: true,
    sandboxed: true,
  };

  constructor(private readonly dispatchService: RunnerDispatchService) {}

  canRun(task: RunnerTask): boolean {
    return this.dispatchService.canDispatchSync(task);
  }

  async *run(task: RunnerTask, signal?: AbortSignal): AsyncIterable<RunnerEvent> {
    for await (const event of this.dispatchService.execute(task, signal)) {
      yield event;
    }
  }
}

