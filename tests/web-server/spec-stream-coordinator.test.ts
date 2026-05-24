import { describe, expect, it, vi } from 'vitest';
import type { UnifiedMessage } from '@agent-flow/core/messages';
import type { ChatStreamEvent, SessionRecord } from '../../apps/web-server/src/contracts/api.js';
import { ValidationError } from '../../apps/web-server/src/lib/errors.js';
import { MemoryRecorder } from '../../apps/web-server/src/chat/turn/memory-recorder.js';
import { SpecStreamCoordinator } from '../../apps/web-server/src/chat/turn/spec-stream-coordinator.js';

const session: SessionRecord = {
  sessionId: 's1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  modelId: 1,
  mode: 'spec',
  cwd: '',
  messageCount: 0,
  specWorkflow: {
    phase: 'tasks',
    awaitingConfirm: false,
  },
};

function assistantMessage(text = '# Task Breakdown'): UnifiedMessage {
  return {
    uuid: 'a1',
    parentUuid: null,
    role: 'assistant',
    content: [{ type: 'text', text }],
    timestamp: '2026-01-01T00:00:00.000Z',
    metadata: {},
  };
}

describe('SpecStreamCoordinator', () => {
  it('converts spec deltas into buffered spec document updates', () => {
    const coordinator = new SpecStreamCoordinator(
      { listMessages: vi.fn() } as never,
      {} as never,
      new MemoryRecorder(),
    );

    const first = coordinator.handleDelta(session, {
      type: 'msg_delta',
      msg_id: 'm1',
      delta: 'hello',
    });
    const second = coordinator.handleDelta(session, {
      type: 'msg_delta',
      msg_id: 'm1',
      delta: ' world',
    });

    expect(first).toMatchObject({ type: 'spec_doc_update', content: 'hello', done: false });
    expect(second).toMatchObject({ type: 'spec_doc_update', content: 'hello world', done: false });
  });

  it('auto-regenerates task output only while the workflow service allows it', async () => {
    const error = new ValidationError('Task breakdown does not satisfy spec contract');
    const specWorkflowService = {
      ensureTaskContractOrThrow: vi.fn(() => {
        throw error;
      }),
      shouldAutoRegenerateForTaskValidationFailure: vi.fn((_error: unknown, attempt: number) => attempt < 2),
      buildTaskRegeneratePromptFromValidation: vi.fn(() => 'regenerate tasks'),
      captureAssistantDocument: vi.fn(),
    };
    const coordinator = new SpecStreamCoordinator(
      { listMessages: vi.fn(async () => []) } as never,
      specWorkflowService as never,
      new MemoryRecorder(),
    );
    const event: Extract<ChatStreamEvent, { type: 'msg' }> = {
      type: 'msg',
      msg: assistantMessage(),
    };

    await expect(coordinator.handleMessage(session, event)).resolves.toMatchObject({
      restart: true,
      requestMessage: 'regenerate tasks',
    });
    await expect(coordinator.handleMessage(session, event)).resolves.toMatchObject({
      restart: true,
      requestMessage: 'regenerate tasks',
    });
    await expect(coordinator.handleMessage(session, event)).rejects.toBe(error);
  });
});
