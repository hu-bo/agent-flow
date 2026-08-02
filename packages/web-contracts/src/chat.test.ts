import { describe, expect, it } from 'vitest';
import { chatStreamEventSchema, chatTurnBodySchema, runnerApprovalDecisionBodySchema } from './index.js';

describe('web contracts', () => {
  it('accepts a semantic message delta event', () => {
    expect(chatStreamEventSchema.parse({
      type: 'message.delta',
      messageId: 'assistant-1',
      delta: 'hello',
      turnId: '0123456789abcdef',
    })).toMatchObject({ type: 'message.delta', delta: 'hello' });
  });

  it('rejects legacy chat protocol fields', () => {
    expect(chatTurnBodySchema.safeParse({
      message: 'hello',
      session_id: 'legacy',
      stream: true,
    }).success).toBe(false);
    expect(chatTurnBodySchema.keyof().options).not.toContain('session_id');
    expect(chatTurnBodySchema.keyof().options).not.toContain('stream');
  });

  it('supports once, always and deny approval decisions', () => {
    expect(runnerApprovalDecisionBodySchema.parse({ decision: 'once' })).toEqual({ decision: 'once' });
    expect(runnerApprovalDecisionBodySchema.parse({ decision: 'always' })).toEqual({ decision: 'always' });
    expect(runnerApprovalDecisionBodySchema.parse({ decision: 'deny' })).toEqual({ decision: 'deny' });
    expect(runnerApprovalDecisionBodySchema.safeParse({ decision: 'yes' }).success).toBe(false);
  });
});
