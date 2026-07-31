import { describe, expect, it } from 'vitest';
import type { AgentEvent, AgentRunResult } from '@agent-flow/core';
import type { RuntimeChatInput } from '../../apps/web-server/src/contracts/api.js';
import { buildRuntimeThinkingMessage } from '../../apps/web-server/src/runtime/runtime-thinking.js';

const now = '2026-06-01T00:00:00.000Z';

function event(type: AgentEvent['type'], payload: Record<string, unknown>): AgentEvent {
  return {
    id: `${type}_${Math.random().toString(16).slice(2)}`,
    taskId: 'task_1',
    sessionId: 'core_session_1',
    type,
    timestamp: now,
    payload,
  };
}

function input(): RuntimeChatInput {
  return {
    session: {
      sessionId: 'chat_session_1',
      projectId: undefined,
      title: 'Thinking turn',
      createdAt: now,
      updatedAt: now,
      modelId: 1,
      mode: 'vibe',
      cwd: '.',
      messageCount: 1,
    },
    history: [],
    userId: 'user_1',
    message: 'Inspect the repo and explain the result',
    modelId: 1,
    model: 'test-model',
    requestId: 'req/1',
    attachments: [],
  };
}

describe('buildRuntimeThinkingMessage', () => {
  it('builds a visible thinking card from plan, llm sections, and tool evidence', () => {
    const events: AgentEvent[] = [
      event('session.started', {
        planId: 'plan_1',
        strategy: 'plan',
        round: 1,
        maxRounds: 3,
        steps: [
          {
            id: 'scan',
            title: 'repo.scan',
            kind: 'tool',
            toolName: 'fs.list',
            input: { path: '.' },
            dependsOn: [],
          },
          {
            id: 'analysis',
            title: 'repo.analysis',
            kind: 'llm',
            dependsOn: ['scan'],
          },
        ],
      }),
      event('tool.result', {
        stepId: 'scan',
        title: 'repo.scan',
        kind: 'tool',
        tool: 'fs.list',
        ok: true,
        output: {
          path: '.',
          total: 12,
          entries: [],
        },
      }),
      event('checkpoint.created', {
        stepId: 'analysis',
        title: 'repo.analysis',
        kind: 'llm',
        checkpointId: 'checkpoint_1',
        output: {
          mode: 'llm-step',
          stepId: 'analysis',
          title: 'repo.analysis',
          phase: 'analysis',
          text: 'Repository analysis complete.',
          sections: {
            analysis: 'The repository is a multi-package agent workspace.',
          },
        },
      }),
      event('session.verification', {
        round: 1,
        status: 'failed',
        verifierName: 'repo-understanding',
        reason: 'Repository understanding answer is missing required repo evidence.',
        missingEvidence: ['quoted-project-evidence'],
        nextAction: 'Reference README.md explicitly.',
      }),
    ];

    const result: AgentRunResult = {
      taskId: 'task_1',
      sessionId: 'core_session_1',
      status: 'succeeded',
      outputs: {
        analysis: {
          ok: true,
        },
      },
      checkpoints: [],
      events,
    };

    const message = buildRuntimeThinkingMessage({
      input: input(),
      parentUuid: null,
      runtimeMode: 'autonomous',
      events,
      result,
      startedAt: Date.parse(now),
    });

    expect(message.uuid).toBe('runtime_thinking_req_1');
    expect(message.metadata.isMeta).toBe(true);
    expect(message).toMatchObject({
      type: 'thinking',
      title: 'Complete thinking',
      status: 'success',
    });

    if (message.type !== 'thinking') {
      throw new Error('Expected a thinking message.');
    }
    expect(message.items?.map((item) => item.key)).toEqual([
      'intent',
      'plan',
      'analysis',
      'tool-evidence',
      'verification',
      'result',
    ]);
    expect(message.text).toContain('The repository is a multi-package agent workspace.');
    expect(message.text).toContain('fs.list');
    expect(message.text).toContain('12 entries');
    expect(message.text).toContain('Verifier: repo-understanding');
    expect(message.text).toContain('Round: 1');
  });
});
