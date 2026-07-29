import type { AgentRunRequest, ContextFragmentInput } from '@agent-flow/core';
import type { RecalledMemory } from '@agent-flow/memory';
import type { RuntimeChatInput } from '../contracts/api.js';
import { summarizeMessages } from '../lib/messages.js';
import { isRuntimeDiagnosticMessage } from './runtime-diagnostics.js';
import { renderEnvironmentContext } from './runtime-renderers.js';
import type { RunnerDirective, RuntimeMode } from './runtime-types.js';

export function buildAgentRequest(
  input: RuntimeChatInput,
  recalled: RecalledMemory[],
  runnerDirective: RunnerDirective | undefined,
  runtimeMode: Exclude<RuntimeMode, 'chat'>,
): AgentRunRequest {
  const recentHistory = input.history
    .filter((message) => !message.metadata?.isMeta && !isRuntimeDiagnosticMessage(message))
    .slice(-8);
  const initialContext: ContextFragmentInput[] = [
    {
      source: 'runtime:environment',
      content: renderEnvironmentContext(input, runtimeMode),
      priority: 120,
      metadata: {
        mode: input.session.mode,
        runtimeMode,
      },
    },
    ...recentHistory.map((message, index) => ({
      source: `history:${message.uuid}`,
      content: toContextText(message),
      priority: 10 + index,
      metadata: {
        role: message.role,
      },
    })),
    ...recalled.map((memory) => ({
      source: `memory:${memory.source}:${memory.id}`,
      content: memory.text,
      priority: 100,
      metadata: {
        score: memory.score,
        source: memory.source,
      },
    })),
  ];

  if (input.attachments.length > 0) {
    for (const attachment of input.attachments) {
      initialContext.push({
        source: `attachment:${attachment.mimeType}`,
        content: `Attachment mime=${attachment.mimeType}, base64Length=${attachment.data.length}`,
        priority: 40,
      });
    }
  }

  const historySummary = summarizeMessages(recentHistory);
  const goalParts: string[] = [
    [
      'Goal-driven autonomous runtime:',
      '- Identify the user goal and available environment.',
      '- Plan internal task steps before execution.',
      '- Execute iteratively with tools/runners/model reasoning as needed.',
      '- Verify or summarize completion with concrete evidence.',
      '',
      `User request:\n${input.message}`,
    ].join('\n'),
  ];
  if (historySummary) {
    goalParts.push(`Recent history:\n${historySummary}`);
  }
  if (recalled.length > 0) {
    goalParts.push(
      `Relevant memory:\n${recalled
        .map((memory) => `- (${memory.source}, score=${memory.score.toFixed(2)}) ${memory.text}`)
        .join('\n')}`,
    );
  }
  if (runnerDirective) {
    goalParts.push(`Runner directive:\ncommand=${runnerDirective.command}\nargs=${runnerDirective.args.join(' ')}`);
  }

  return {
    goal: goalParts.join('\n\n'),
    strategy: 'plan',
    initialContext,
    runnerCommand: runnerDirective?.command,
    runnerArgs: runnerDirective?.args,
    metadata: {
      ...buildToolContextMetadata(input),
      runtimeMode,
      autonomousRuntime: true,
    },
  };
}

export function buildToolContextMetadata(input: RuntimeChatInput): Record<string, unknown> {
  return {
    modelId: input.modelId,
    model: input.model,
    requestId: input.requestId,
    userId: input.userId,
    sessionId: input.session.sessionId,
    projectId: input.session.projectId,
    approvalScope: input.session.projectId
      ? { type: 'project', id: input.session.projectId, label: input.session.projectId }
      : { type: 'chat', id: input.session.sessionId, label: input.session.title ?? input.session.sessionId },
    sessionCwd: input.session.cwd,
    cwd: input.session.cwd,
    userMessage: input.message,
    preferredRunnerId: input.preferredRunnerId,
    approveRiskyOps: Boolean(input.approveRiskyOps),
    approvalTicket:
      typeof input.approvalTicket === 'string' && input.approvalTicket.trim().length > 0
        ? input.approvalTicket.trim()
        : undefined,
    reasoningEffort: input.reasoningEffort ?? 'medium',
    attachmentCount: input.attachments.length,
  };
}

function toContextText(message: RuntimeChatInput['history'][number]): string {
  const text = message.content
    .map((part) => {
      if (part.type === 'text') return part.text;
      if (part.type === 'file') return `[file ${part.mimeType}, base64Length=${part.data.length}]`;
      if (part.type === 'tool-call') return `[tool-call ${part.toolName}]`;
      if (part.type === 'tool-result') return `[tool-result ${part.toolName}]`;
      if (part.type === 'image') {
        if (part.source.type === 'url') {
          return `[image url=${part.source.url}]`;
        }
        return `[image base64Length=${part.source.data.length}]`;
      }
      return '';
    })
    .filter(Boolean)
    .join(' ');

  return `${message.role}: ${text}`.trim();
}
