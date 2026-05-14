import { describe, expect, it } from 'vitest';
import type { UnifiedMessage } from '@agent-flow/core/messages';
import { SessionService } from '../apps/web-server/src/services/session-service.js';
import { SpecWorkflowService } from '../apps/web-server/src/services/spec-workflow-service.js';
import { ConflictError, ValidationError } from '../apps/web-server/src/lib/errors.js';

function makeAssistantMessage(text: string): UnifiedMessage {
  return {
    uuid: Math.random().toString(16).slice(2, 18).padEnd(16, '0'),
    parentUuid: null,
    role: 'assistant',
    content: [{ type: 'text', text }],
    timestamp: new Date().toISOString(),
    metadata: {},
  };
}

describe('SpecWorkflowService', () => {
  it('starts spec session in requirements phase', () => {
    const sessionService = new SessionService(process.cwd());
    const spec = new SpecWorkflowService(sessionService);
    const session = sessionService.createSession({
      modelId: 1,
      mode: 'spec',
      cwd: process.cwd(),
    });
    const state = spec.ensureSpecState(session.sessionId);
    expect(state.workflow.phase).toBe('requirements');
    expect(state.workflow.awaitingConfirm).toBe(false);
  });

  it('moves requirements -> design -> tasks with two confirms', () => {
    const sessionService = new SessionService(process.cwd());
    const spec = new SpecWorkflowService(sessionService);
    const session = sessionService.createSession({
      modelId: 1,
      mode: 'spec',
      cwd: process.cwd(),
    });

    spec.onAssistantMessageCreated(
      session.sessionId,
      makeAssistantMessage(
        '# Requirements\n## 背景\nA\n## 目标\nB\n## 需求\n### 需求1\nC\n### 需求2\nD',
      ),
    );
    let state = spec.ensureSpecState(session.sessionId);
    expect(state.workflow.awaitingConfirm).toBe(true);

    const first = spec.confirm(session.sessionId);
    expect(first.workflow.phase).toBe('design');
    expect(Boolean(first.autoPrompt)).toBe(true);

    spec.onAssistantMessageCreated(
      session.sessionId,
      makeAssistantMessage('# Design\n## Solution 1\nA\n## Solution 2\nB'),
    );
    state = spec.ensureSpecState(session.sessionId);
    expect(state.workflow.awaitingConfirm).toBe(true);

    const second = spec.confirm(session.sessionId);
    expect(second.workflow.phase).toBe('tasks');
    expect(Boolean(second.autoPrompt)).toBe(true);
  });

  it('confirm is idempotent in tasks phase', () => {
    const sessionService = new SessionService(process.cwd());
    const spec = new SpecWorkflowService(sessionService);
    const session = sessionService.createSession({
      modelId: 1,
      mode: 'spec',
      cwd: process.cwd(),
    });
    const workflow = spec.ensureSpecState(session.sessionId).workflow;
    workflow.phase = 'tasks';
    workflow.awaitingConfirm = true;

    const once = spec.confirm(session.sessionId);
    const twice = spec.confirm(session.sessionId);
    expect(once.workflow.phase).toBe('tasks');
    expect(twice.workflow.phase).toBe('tasks');
    expect(once.autoPrompt).toBeUndefined();
    expect(twice.autoPrompt).toBeUndefined();
  });

  it('throws 409-equivalent error for non-spec session confirm', () => {
    const sessionService = new SessionService(process.cwd());
    const spec = new SpecWorkflowService(sessionService);
    const session = sessionService.createSession({
      modelId: 1,
      mode: 'vibe',
      cwd: process.cwd(),
    });
    expect(() => spec.confirm(session.sessionId)).toThrow(ConflictError);
  });

  it('validates tasks contract and rejects forbidden deferred wording', () => {
    const sessionService = new SessionService(process.cwd());
    const spec = new SpecWorkflowService(sessionService);
    const session = sessionService.createSession({
      modelId: 1,
      mode: 'spec',
      cwd: process.cwd(),
    });
    const workflow = spec.ensureSpecState(session.sessionId).workflow;
    workflow.phase = 'tasks';

    const invalid = makeAssistantMessage([
      '# Task Breakdown',
      '## 必选任务 (Required Tasks)',
      '- [Web] [Alice] [2h] implement session mode; 后续再设计数据层',
      '## 可选任务 (Optional Tasks)',
      '- [QA] [Bob] [1h] extend regression cases',
    ].join('\n'));

    expect(() => spec.ensureTaskContractOrThrow(invalid)).toThrow(ValidationError);
  });

  it('accepts valid tasks contract', () => {
    const sessionService = new SessionService(process.cwd());
    const spec = new SpecWorkflowService(sessionService);
    const session = sessionService.createSession({
      modelId: 1,
      mode: 'spec',
      cwd: process.cwd(),
    });
    const workflow = spec.ensureSpecState(session.sessionId).workflow;
    workflow.phase = 'tasks';

    const valid = makeAssistantMessage([
      '# Task Breakdown',
      '## 必选任务 (Required Tasks)',
      '- [Web] [Alice] [2h] implement spec workflow stage bar and confirm button interactions',
      '- [API] [Bob] [3h] add spec state/confirm endpoints and integrate phase transitions',
      '## 可选任务 (Optional Tasks)',
      '- [QA] [Cara] [1h] add UI regression checks for spec/vibe split rendering',
    ].join('\n'));

    expect(() => spec.ensureTaskContractOrThrow(valid)).not.toThrow();
  });

  it('captures spec documents separately and returns a chat summary', () => {
    const sessionService = new SessionService(process.cwd());
    const spec = new SpecWorkflowService(sessionService);
    const session = sessionService.createSession({
      modelId: 1,
      mode: 'spec',
      cwd: process.cwd(),
    });
    const source = makeAssistantMessage('# Requirements\n## 背景\nA\n## 目标\nB\n## 需求\n### 需求1\nC');

    const captured = spec.captureAssistantDocument(session.sessionId, source);

    expect(captured?.docType).toBe('requirements');
    expect(captured?.content).toContain('# Requirements');
    expect(captured?.summary.content[0]).toMatchObject({
      type: 'text',
      text: expect.not.stringContaining('# Requirements'),
    });
    expect(spec.ensureSpecState(session.sessionId).workflow.documents?.requirements).toContain('# Requirements');
  });

  it('injects stored spec documents into later phase prompts', () => {
    const sessionService = new SessionService(process.cwd());
    const spec = new SpecWorkflowService(sessionService);
    const session = sessionService.createSession({
      modelId: 1,
      mode: 'spec',
      cwd: process.cwd(),
    });
    const workflow = spec.ensureSpecState(session.sessionId).workflow;
    workflow.phase = 'design';
    workflow.documents = {
      requirements: '# Requirements\n## 背景\nPersist me',
    };

    const prompt = spec.buildSpecPrompt({ session, phase: 'design' });

    expect(prompt).toContain('Existing requirements.md:');
    expect(prompt).toContain('Persist me');
  });
});
