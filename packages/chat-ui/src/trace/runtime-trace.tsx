import { useMemo, type CSSProperties, type ReactNode } from 'react';
import type {
  ChatMessage,
  ThinkingPart,
  ThoughtChainItem,
  ThoughtChainItemStatus,
} from '../types';
import type {
  RunnerFilesChangedPayload,
  ToolCallPart,
  ToolResultPart,
  UnifiedMessage,
} from '@agent-flow/core/messages';
import { ThoughtChain } from '../components/ThoughtChain/ThoughtChain';
import { ToolCallRenderer } from '../renderers/ToolCallRenderer';
import { ToolResultRenderer } from '../renderers/ToolResultRenderer';

export interface AggregateRuntimeTraceOptions {
  /**
   * When true (default), attaches the trace as a `thinking` part onto the next assistant message.
   * When false, emits a standalone assistant message containing only the trace.
   */
  attachToNextAssistant?: boolean;
}

const MAX_LOG_CHARS = 120_000;
const MAX_LOG_LINES = 2_000;

export function aggregateRuntimeTraceMessages(
  messages: UnifiedMessage[],
  options: AggregateRuntimeTraceOptions = {},
): ChatMessage[] {
  const attachToNextAssistant = options.attachToNextAssistant !== false;

  const aggregated: ChatMessage[] = [];
  let pendingMeta: UnifiedMessage[] = [];

  const flushAsStandalone = () => {
    if (pendingMeta.length === 0) return;
    aggregated.push(buildStandaloneTraceMessage(pendingMeta));
    pendingMeta = [];
  };

  for (const message of messages) {
    if (isRuntimeMetaToolMessage(message)) {
      pendingMeta.push(message);
      continue;
    }

    if (
      attachToNextAssistant &&
      isVisibleAssistantMessage(message) &&
      (pendingMeta.length > 0 || hasRuntimeTraceMetadata(message))
    ) {
      aggregated.push(attachTracePart(message, pendingMeta));
      pendingMeta = [];
      continue;
    }

    if (!attachToNextAssistant) {
      // Keep traces positioned in the stream when not attaching.
      flushAsStandalone();
    }

    aggregated.push(message as ChatMessage);
  }

  if (pendingMeta.length > 0) {
    flushAsStandalone();
  }

  return aggregated;
}

function isVisibleAssistantMessage(message: UnifiedMessage): boolean {
  return message.role === 'assistant' && message.metadata?.isMeta !== true;
}

function attachTracePart(assistantMessage: UnifiedMessage, metaMessages: UnifiedMessage[]): ChatMessage {
  const thinking = buildTraceThinkingPart(metaMessages, assistantMessage);

  // Put the trace first so it's visible even if the assistant message body is long.
  return {
    ...(assistantMessage as ChatMessage),
    content: [thinking, ...(assistantMessage.content as ChatMessage['content'])],
  };
}

function buildStandaloneTraceMessage(metaMessages: UnifiedMessage[]): ChatMessage {
  const thinking = buildTraceThinkingPart(metaMessages);
  const first = metaMessages[0];
  const last = metaMessages[metaMessages.length - 1];

  return {
    uuid: `runtime_trace_${first?.uuid ?? last?.uuid ?? 'unknown'}`,
    parentUuid: first?.parentUuid ?? null,
    role: 'assistant',
    content: [thinking],
    timestamp: last?.timestamp ?? new Date().toISOString(),
    metadata: {
      provider: 'core-runtime',
      isMeta: true,
      extensions: {
        runtimeTrace: true,
        chainStartUuid: first?.uuid,
        chainEndUuid: last?.uuid,
      },
    },
  };
}

type RuntimeMetaPart =
  | {
      kind: 'tool-call';
      timestamp: string;
      streamEvent?: string;
      part: ToolCallPart;
    }
  | {
      kind: 'tool-result';
      timestamp: string;
      streamEvent?: string;
      part: ToolResultPart;
    };

type StepTrace = {
  stepId: string;
  title: string;
  kind: string;
  status: ThoughtChainItemStatus;
  startedAt?: string;
  endedAt?: string;
  durationMs?: number;
  error?: string;
  errorDetails?: unknown;
  checkpointId?: string;
  checkpointOutput?: unknown;
  parts: RuntimeMetaPart[];
};

type SessionTrace = {
  durationMs?: number;
  hasError: boolean;
  sessionEvents: RuntimeMetaPart[];
  steps: StepTrace[];
  orphanParts: RuntimeMetaPart[];
};

function buildTraceThinkingPart(
  metaMessages: UnifiedMessage[],
  assistantMessage?: UnifiedMessage,
): ThinkingPart {
  const trace = parseSessionTrace(metaMessages);

  const items: ThoughtChainItem[] = [];
  const defaultExpandedKeys: string[] = [];

  // Session-level events (start/replan/fail) are helpful for debugging, but noisy in the happy path.
  const interestingSessionEvents = trace.sessionEvents.filter((evt) => {
    if (evt.kind === 'tool-result' && evt.part.isError) return true;
    const stream = evt.streamEvent ?? '';
    return stream === 'session.replanned' || stream === 'session.failed';
  });

  const displaySessionEvents =
    interestingSessionEvents.length > 0 || trace.steps.length === 0
      ? (interestingSessionEvents.length > 0 ? interestingSessionEvents : trace.sessionEvents)
      : [];

  if (displaySessionEvents.length > 0) {
    items.push({
      key: 'session-events',
      title: 'Session',
      description: `${displaySessionEvents.length} event(s)`,
      status: trace.hasError ? 'error' : 'success',
      collapsible: true,
      content: (
        <TracePartsList
          items={displaySessionEvents}
          defaultExpanded={trace.hasError}
          kindHint="session"
        />
      ),
    });
    if (trace.hasError) {
      defaultExpandedKeys.push('session-events');
    }
  }

  trace.steps.forEach((step, index) => {
    const item = buildStepItem(step, index);
    items.push(item);
    if (trace.hasError && step.status === 'error') {
      defaultExpandedKeys.push(item.key);
    }
  });

  if (trace.steps.length === 0) {
    items.push(...buildPlannedStepItems(assistantMessage, items.length, trace.hasError));
  }

  if (trace.orphanParts.length > 0) {
    items.push({
      key: 'orphan-events',
      title: 'Other runtime events',
      description: `${trace.orphanParts.length} item(s)`,
      status: trace.hasError ? 'error' : 'success',
      collapsible: true,
      content: (
        <TracePartsList items={trace.orphanParts} defaultExpanded={false} kindHint="orphan" />
      ),
    });
    if (trace.hasError) {
      defaultExpandedKeys.push('orphan-events');
    }
  }

  if (items.length === 0) {
    items.push({
      key: 'runtime-trace-empty',
      title: 'Runtime trace',
      description: 'No step events were returned',
      status: trace.hasError ? 'error' : 'success',
    });
  }

  return {
    type: 'thinking',
    text: '',
    status: trace.hasError ? 'error' : 'success',
    defaultExpandedKeys: trace.hasError ? defaultExpandedKeys : undefined,
    durationMs: trace.durationMs,
    items,
  };
}

function buildStepItem(step: StepTrace, index: number): ThoughtChainItem {
  const kindLabel = step.kind || 'unknown';
  const descParts: string[] = [];
  descParts.push(kindLabel);
  const primaryCall = findPrimaryToolCall(step);
  if (primaryCall) {
    descParts.push(`tool=${primaryCall.toolName}`);
  }
  if (step.durationMs != null) descParts.push(formatDuration(step.durationMs));
  if (step.status === 'error' && step.error) {
    descParts.push(`error=${truncate(step.error, 140)}`);
  }

  const extra = buildStepExtra(step);
  const hasContent =
    step.parts.length > 0 ||
    Boolean(step.errorDetails) ||
    Boolean(step.checkpointId) ||
    step.checkpointOutput !== undefined;

  return {
    key: `step:${step.stepId}`,
    title: `${index + 1}. ${step.title || 'step'}`,
    description: descParts.join('  '),
    status: step.status,
    extra,
    collapsible: hasContent,
    content: hasContent ? <StepDetail step={step} /> : undefined,
  };
}

function buildPlannedStepItems(
  assistantMessage: UnifiedMessage | undefined,
  offset: number,
  hasError: boolean,
): ThoughtChainItem[] {
  const extensions = asRecord(assistantMessage?.metadata?.extensions);
  const eventCount = typeof extensions?.eventCount === 'number' ? extensions.eventCount : undefined;
  const runtimeMode = readNonEmptyString(extensions?.runtimeMode);
  const coreSessionId = readNonEmptyString(extensions?.coreSessionId);
  const status: ThoughtChainItemStatus = hasError || extensions?.status === 'failed' ? 'error' : 'success';

  const detailedSteps = readPlannedStepDetails(extensions?.plannedStepDetails);
  if (detailedSteps.length > 0) {
    return detailedSteps.map((step, index) => {
      const descParts: string[] = [];
      if (step.kind) descParts.push(`kind=${step.kind}`);
      if (step.toolName) descParts.push(`tool=${step.toolName}`);
      if (step.durationMs != null) descParts.push(formatDuration(step.durationMs));
      if (step.status === 'error' && step.error) {
        descParts.push(`error=${truncate(step.error, 140)}`);
      }

      const contentBlocks: string[] = [
        step.stepId ? `stepId=${step.stepId}` : null,
        step.startedAt ? `startedAt=${step.startedAt}` : null,
        step.endedAt ? `endedAt=${step.endedAt}` : null,
        step.toolInputPreview ? `toolInputPreview:\n${safeJson(step.toolInputPreview)}` : null,
        step.runner ? `runner:\n${safeJson(step.runner)}` : null,
        step.checkpointId ? `checkpointId=${step.checkpointId}` : null,
        step.errorDetails !== undefined ? `errorDetails:\n${safeJson(step.errorDetails)}` : null,
      ].filter((v): v is string => Boolean(v));

      return {
        key: `planned_detail:${step.stepId || index}`,
        title: `${offset + index + 1}. ${step.title || 'step'}`,
        description: descParts.length > 0 ? descParts.join('  ') : 'step',
        status: step.status || status,
        collapsible: contentBlocks.length > 0,
        content: contentBlocks.length > 0 ? contentBlocks.join('\n\n') : undefined,
      };
    });
  }

  const plannedSteps = readStringArray(assistantMessage?.metadata?.extensions?.plannedSteps);
  if (plannedSteps.length === 0) {
    return [];
  }
  const fallbackNote = [
    'Detailed step events were not included in this response.',
    eventCount != null ? `eventCount=${eventCount}` : null,
    runtimeMode ? `runtimeMode=${runtimeMode}` : null,
    coreSessionId ? `coreSessionId=${coreSessionId}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  return plannedSteps.map((title, index) => ({
    key: `planned:${index}:${title}`,
    title: `${offset + index + 1}. ${title}`,
    description: 'planned step',
    status,
    collapsible: true,
    content: fallbackNote,
  }));
}

type PlannedStepDetail = {
  stepId: string;
  title: string;
  kind: string;
  status: ThoughtChainItemStatus;
  startedAt?: string;
  endedAt?: string;
  durationMs?: number;
  toolName?: string;
  toolInputPreview?: unknown;
  runner?: unknown;
  error?: string;
  errorDetails?: unknown;
  checkpointId?: string;
};

function readPlannedStepDetails(value: unknown): PlannedStepDetail[] {
  if (!Array.isArray(value)) return [];

  const out: PlannedStepDetail[] = [];
  for (const item of value) {
    const rec = asRecord(item);
    if (!rec) continue;

    const stepId = readNonEmptyString(rec.stepId) ?? '';
    const title = readNonEmptyString(rec.title) ?? 'step';
    const kind = readNonEmptyString(rec.kind) ?? 'unknown';
    const statusRaw = readNonEmptyString(rec.status) ?? 'running';
    const status: ThoughtChainItemStatus =
      statusRaw === 'pending' || statusRaw === 'running' || statusRaw === 'success' || statusRaw === 'error'
        ? statusRaw
        : 'running';

    const startedAt = readNonEmptyString(rec.startedAt) ?? undefined;
    const endedAt = readNonEmptyString(rec.endedAt) ?? undefined;
    const durationMs =
      typeof rec.durationMs === 'number' && Number.isFinite(rec.durationMs) ? rec.durationMs : undefined;
    const toolName = readNonEmptyString(rec.toolName) ?? undefined;
    const toolInputPreview = rec.toolInputPreview;
    const runner = rec.runner;
    const error = readNonEmptyString(rec.error) ?? undefined;
    const errorDetails = rec.errorDetails;
    const checkpointId = readNonEmptyString(rec.checkpointId) ?? undefined;

    out.push({
      stepId,
      title,
      kind,
      status,
      startedAt,
      endedAt,
      durationMs,
      toolName,
      toolInputPreview,
      runner,
      error,
      errorDetails,
      checkpointId,
    });
  }

  return out;
}

function buildStepExtra(step: StepTrace): ReactNode | undefined {
  const toolResult = findPrimaryToolResult(step);
  if (toolResult?.output) {
    const payload = asRunnerFilesChangedPayload(toolResult.output);
    if (payload) {
      const { summary } = payload;
      return (
        <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          <span style={pillStyle('#ecf3ff', '#37506e')}>{summary.filesChanged} file(s)</span>
          <span style={pillStyle('#ddfbe7', '#146c35')}>+{summary.additions}</span>
          <span style={pillStyle('#ffe7ea', '#a11f30')}>-{summary.deletions}</span>
        </span>
      );
    }
  }

  const runnerSummary = trySummarizeRunner(step);
  if (runnerSummary) {
    return <span style={pillStyle('#ecf3ff', '#37506e')}>{runnerSummary}</span>;
  }

  const toolCall = findPrimaryToolCall(step);
  if (toolCall) {
    const short = summarizeToolCall(toolCall.toolName, toolCall.input);
    if (short) {
      return <span style={pillStyle('#ecf3ff', '#37506e')}>{truncate(short, 60)}</span>;
    }
  }

  return undefined;
}

function pillStyle(bg: string, fg: string): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: 999,
    padding: '2px 8px',
    fontSize: 11,
    fontFamily: '"JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace',
    background: bg,
    color: fg,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
  };
}

function StepDetail({ step }: { step: StepTrace }) {
  const toolCall = findPrimaryToolCall(step);
  const toolResult = findPrimaryToolResult(step);
  const runner = useMemo(() => extractRunnerLog(step), [step]);

  // If there are more meta parts beyond the primary tool call/result, keep them visible as raw trace.
  const leftovers = step.parts.filter((p) => {
    const name = p.part.toolName;
    if (name === 'agent.step' || name === 'agent.checkpoint') return false;
    if (toolCall && p.kind === 'tool-call' && p.part.toolName === toolCall.toolName) return false;
    if (toolResult && p.kind === 'tool-result' && p.part.toolName === toolResult.toolName) return false;
    if (name === 'runner.exec') return false;
    return true;
  });

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {toolCall && (
        <ToolCallRenderer part={toolCall} message={DUMMY_RENDER_MESSAGE} index={0} />
      )}
      {toolResult && (
        <ToolResultRenderer part={toolResult} message={DUMMY_RENDER_MESSAGE} index={0} />
      )}
      {runner && <RunnerLogView log={runner} />}

      {step.checkpointOutput !== undefined && (
        <StepOutputView output={step.checkpointOutput} kind={step.kind} />
      )}

      {step.checkpointId && (
        <div
          style={{
            fontFamily: '"JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace',
            fontSize: 12,
            color: 'var(--chat-text-subtle)',
          }}
        >
          checkpoint: {step.checkpointId}
        </div>
      )}

      {step.status === 'error' && step.errorDetails != null && (
        <details open>
          <summary style={detailsSummaryStyle}>error details</summary>
          <JsonPreview value={step.errorDetails} />
        </details>
      )}

      {leftovers.length > 0 && (
        <details>
          <summary style={detailsSummaryStyle}>raw step events ({leftovers.length})</summary>
          <TracePartsList items={leftovers} defaultExpanded={false} kindHint="step" />
        </details>
      )}
    </div>
  );
}

function StepOutputView({ output, kind }: { output: unknown; kind: string }) {
  const record = asRecord(output);
  const text = record ? readNonEmptyString(record.text) : null;
  const title = kind === 'llm' ? 'model step output' : 'checkpoint output';

  return (
    <details open={kind === 'llm'}>
      <summary style={detailsSummaryStyle}>{title}</summary>
      {text ? <TextPreview value={text} /> : <JsonPreview value={output} />}
    </details>
  );
}

function TextPreview({ value }: { value: string }) {
  const isLong = value.length > 12_000;
  return (
    <pre
      style={{
        borderRadius: 10,
        border: '1px solid var(--chat-border)',
        background: '#f7faff',
        padding: '10px 12px',
        overflowX: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontSize: 12,
        fontFamily: '"JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace',
        color: 'var(--chat-text-primary)',
        maxHeight: isLong ? 420 : undefined,
      }}
    >
      {isLong ? `${value.slice(0, 12_000)}\n... (truncated)` : value}
    </pre>
  );
}

type RunnerLog = {
  command?: string;
  args?: string[];
  startedAt?: string;
  completedAt?: string;
  exitCode?: number;
  hasError: boolean;
  isCompleted: boolean;
  stdout: string[];
  stderr: string[];
  progress: string[];
  raw: unknown[];
  truncated: boolean;
};

function RunnerLogView({ log }: { log: RunnerLog }) {
  const header = log.command
    ? `${log.command}${log.args && log.args.length > 0 ? ` ${log.args.join(' ')}` : ''}`
    : '(runner)';

  const stats: string[] = [];
  if (log.stdout.length > 0) stats.push(`stdout:${log.stdout.length}`);
  if (log.stderr.length > 0) stats.push(`stderr:${log.stderr.length}`);
  if (log.progress.length > 0) stats.push(`progress:${log.progress.length}`);
  if (log.isCompleted && typeof log.exitCode === 'number') stats.push(`exit:${log.exitCode}`);
  if (log.truncated) stats.push('truncated');

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div
        style={{
          fontFamily: '"JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace',
          fontSize: 12,
          color: 'var(--chat-text-primary)',
        }}
      >
        {header}
        {stats.length > 0 ? (
          <span style={{ color: 'var(--chat-text-subtle)' }}>  ({stats.join(', ')})</span>
        ) : null}
      </div>

      {log.progress.length > 0 && <LogBlock title="progress" lines={log.progress} tone="info" />}
      {log.stdout.length > 0 && <LogBlock title="stdout" lines={log.stdout} tone="stdout" />}
      {log.stderr.length > 0 && <LogBlock title="stderr" lines={log.stderr} tone="stderr" />}

      {log.raw.length > 0 && (
        <details>
          <summary style={detailsSummaryStyle}>raw runner events ({log.raw.length})</summary>
          <JsonPreview value={log.raw} />
        </details>
      )}
    </div>
  );
}

const detailsSummaryStyle: CSSProperties = {
  cursor: 'pointer',
  fontFamily: '"JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace',
  fontSize: 12,
  color: 'var(--chat-text-subtle)',
};

function LogBlock({
  title,
  lines,
  tone,
}: {
  title: string;
  lines: string[];
  tone: 'info' | 'stdout' | 'stderr';
}) {
  const bg =
    tone === 'stderr' ? 'var(--chat-danger-surface)' : tone === 'stdout' ? '#f7faff' : '#edf4ff';
  const fg = tone === 'stderr' ? 'var(--chat-danger-text)' : 'var(--chat-text-primary)';
  const border = tone === 'stderr' ? 'var(--chat-danger-border)' : 'var(--chat-border)';

  const body = lines.join('\n');

  return (
    <details open={tone === 'stderr'}>
      <summary style={detailsSummaryStyle}>
        {title} ({lines.length})
      </summary>
      <pre
        style={{
          marginTop: 6,
          borderRadius: 10,
          border: `1px solid ${border}`,
          background: bg,
          padding: '10px 12px',
          overflowX: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontSize: 12,
          fontFamily: '"JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace',
          color: fg,
        }}
      >
        {body}
      </pre>
    </details>
  );
}

function TracePartsList({
  items,
  defaultExpanded,
  kindHint,
}: {
  items: RuntimeMetaPart[];
  defaultExpanded: boolean;
  kindHint: 'session' | 'step' | 'orphan';
}) {
  const chainItems: ThoughtChainItem[] = items.map((evt, idx) => {
    const title =
      evt.kind === 'tool-call'
        ? `Call: ${evt.part.toolName}`
        : `Result: ${evt.part.toolName}${evt.part.isError ? ' (error)' : ''}`;
    const status: ThoughtChainItemStatus =
      evt.kind === 'tool-result' && evt.part.isError ? 'error' : 'success';

    const desc = [
      evt.streamEvent ? `stream=${evt.streamEvent}` : null,
      evt.timestamp ? `t=${evt.timestamp}` : null,
    ]
      .filter(Boolean)
      .join('  ');

    const contentValue = evt.kind === 'tool-call' ? evt.part.input : evt.part.output;

    return {
      key: `${kindHint}:${idx}:${evt.part.toolName}`,
      title,
      description: desc,
      status,
      collapsible: true,
      content: <JsonPreview value={contentValue} />,
    };
  });

  const defaultOpenKeys = defaultExpanded ? chainItems.map((i) => i.key) : undefined;

  return (
    <ThoughtChain
      items={chainItems}
      size="sm"
      line={false}
      defaultExpandedKeys={defaultOpenKeys}
    />
  );
}

function JsonPreview({ value }: { value: unknown }) {
  const text = safeJson(value);
  const isLong = text.length > 8_000;
  return (
    <pre
      style={{
        borderRadius: 10,
        border: '1px solid var(--chat-border)',
        background: '#f7faff',
        padding: '10px 12px',
        overflowX: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontSize: 12,
        fontFamily: '"JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace',
        color: 'var(--chat-text-primary)',
        maxHeight: isLong ? 420 : undefined,
      }}
    >
      {isLong ? `${text.slice(0, 8_000)}\n... (truncated)` : text}
    </pre>
  );
}

function parseSessionTrace(metaMessages: UnifiedMessage[]): SessionTrace {
  const timestampValues = metaMessages
    .map((message) => Date.parse(message.timestamp))
    .filter((value) => Number.isFinite(value));
  const durationMs =
    timestampValues.length > 1
      ? Math.max(0, Math.max(...timestampValues) - Math.min(...timestampValues))
      : undefined;

  const stepMap = new Map<string, StepTrace>();
  const sessionEvents: RuntimeMetaPart[] = [];
  const orphanParts: RuntimeMetaPart[] = [];
  let hasError = false;

  for (const msg of metaMessages) {
    const streamEvent =
      typeof msg.metadata?.extensions?.streamEvent === 'string'
        ? msg.metadata.extensions.streamEvent
        : undefined;

    for (const part of msg.content) {
      if (part.type !== 'tool-call' && part.type !== 'tool-result') continue;

      const metaPart: RuntimeMetaPart =
        part.type === 'tool-call'
          ? { kind: 'tool-call', timestamp: msg.timestamp, streamEvent, part }
          : { kind: 'tool-result', timestamp: msg.timestamp, streamEvent, part };

      if (part.type === 'tool-result' && part.isError) {
        hasError = true;
      }

      if (part.toolName === 'agent.session' || part.toolName === 'agent.replan') {
        sessionEvents.push(metaPart);
        continue;
      }

      // Step id is encoded as toolCallId in this runtime meta stream.
      const stepId = part.toolCallId;
      if (!stepId) {
        orphanParts.push(metaPart);
        continue;
      }

      const step = getOrCreateStep(stepMap, stepId);
      step.parts.push(metaPart);

      // Derive step status/title from agent.step marker messages.
      if (part.toolName === 'agent.step') {
        const payload = part.type === 'tool-call' ? part.input : part.output;
        const record = asRecord(payload);
        if (record) {
          const title = readNonEmptyString(record.title);
          const kind = readNonEmptyString(record.kind);
          const status = readNonEmptyString(record.status);
          const error = readNonEmptyString(record.error);

          if (title) step.title = title;
          if (kind) step.kind = kind;

          if (part.type === 'tool-call' && status === 'started') {
            step.startedAt = msg.timestamp;
            step.status = 'running';
          }

          if (part.type === 'tool-result' && status === 'completed') {
            step.endedAt = msg.timestamp;
            step.status = 'success';
          }

          if (part.type === 'tool-result' && status === 'failed') {
            step.endedAt = msg.timestamp;
            step.status = 'error';
            if (error) step.error = error;
            const details = record.errorDetails;
            if (details !== undefined) step.errorDetails = details;
            hasError = true;
          }
        }
      }

      if (part.toolName === 'agent.checkpoint' && part.type === 'tool-result') {
        const record = asRecord(part.output);
        const checkpointId = record ? readNonEmptyString(record.checkpointId) : null;
        const title = record ? readNonEmptyString(record.title) : null;
        const kind = record ? readNonEmptyString(record.kind) : null;
        if (checkpointId) step.checkpointId = checkpointId;
        if (title) step.title = title;
        if (kind) step.kind = kind;
        if (record && 'output' in record) {
          step.checkpointOutput = record.output;
        }
      }
    }
  }

  // Finalize step durations and defaults.
  const steps: StepTrace[] = Array.from(stepMap.values());
  for (const step of steps) {
    step.title = step.title || 'step';
    step.kind = step.kind || 'unknown';
    if (step.startedAt && step.endedAt) {
      const start = Date.parse(step.startedAt);
      const end = Date.parse(step.endedAt);
      if (Number.isFinite(start) && Number.isFinite(end)) {
        step.durationMs = Math.max(0, end - start);
      }
    }
  }

  // Stable sort by first timestamp seen for this step.
  steps.sort((a, b) => {
    const ta = firstTimestampMs(a.parts) ?? 0;
    const tb = firstTimestampMs(b.parts) ?? 0;
    return ta - tb;
  });

  return {
    durationMs,
    hasError,
    sessionEvents,
    steps,
    orphanParts,
  };
}

function getOrCreateStep(map: Map<string, StepTrace>, stepId: string): StepTrace {
  const existing = map.get(stepId);
  if (existing) return existing;
  const created: StepTrace = {
    stepId,
    title: 'step',
    kind: 'unknown',
    status: 'running',
    parts: [],
  };
  map.set(stepId, created);
  return created;
}

function firstTimestampMs(parts: RuntimeMetaPart[]): number | null {
  for (const p of parts) {
    const ms = Date.parse(p.timestamp);
    if (Number.isFinite(ms)) return ms;
  }
  return null;
}

function findPrimaryToolCall(step: StepTrace): ToolCallPart | null {
  // Prefer a non-agent call (actual tool/runner).
  const call = step.parts.find((p) => p.kind === 'tool-call' && p.part.toolName !== 'agent.step') as
    | Extract<RuntimeMetaPart, { kind: 'tool-call' }>
    | undefined;
  return call?.part ?? null;
}

function findPrimaryToolResult(step: StepTrace): ToolResultPart | null {
  if (step.kind === 'runner') {
    return null;
  }

  // Prefer a non-agent result (actual tool/runner result). If none, fallback to agent.step result.
  const nonAgent = step.parts.find(
    (p) =>
      p.kind === 'tool-result' &&
      p.part.toolName !== 'agent.step' &&
      p.part.toolName !== 'agent.checkpoint',
  ) as Extract<RuntimeMetaPart, { kind: 'tool-result' }> | undefined;
  if (nonAgent) return nonAgent.part;

  const agent = step.parts.find((p) => p.kind === 'tool-result' && p.part.toolName === 'agent.step') as
    | Extract<RuntimeMetaPart, { kind: 'tool-result' }>
    | undefined;
  return agent?.part ?? null;
}

function trySummarizeRunner(step: StepTrace): string | null {
  const runner = extractRunnerLog(step);
  if (!runner) return null;
  if (runner.isCompleted && typeof runner.exitCode === 'number') return `exit ${runner.exitCode}`;
  if (runner.hasError) return 'runner error';
  return null;
}

function extractRunnerLog(step: StepTrace): RunnerLog | null {
  const runnerParts = step.parts.filter((p) => p.part.toolName === 'runner.exec');
  if (runnerParts.length === 0) return null;

  const toolCall = runnerParts.find((p) => p.kind === 'tool-call') as
    | Extract<RuntimeMetaPart, { kind: 'tool-call' }>
    | undefined;
  const callInput = toolCall?.part.input;
  const callRecord = asRecord(callInput);
  const command = callRecord ? readNonEmptyString(callRecord.command) ?? undefined : undefined;
  const args =
    callRecord && Array.isArray(callRecord.args) ? callRecord.args.map((v) => String(v)) : undefined;

  const stdout: string[] = [];
  const stderr: string[] = [];
  const progress: string[] = [];
  const raw: unknown[] = [];
  let hasError = false;
  let isCompleted = false;
  let exitCode: number | undefined;
  let truncated = false;

  let totalChars = 0;
  const pushLine = (bucket: string[], line: string) => {
    if (bucket.length >= MAX_LOG_LINES) {
      truncated = true;
      return;
    }
    totalChars += line.length;
    if (totalChars > MAX_LOG_CHARS) {
      truncated = true;
      return;
    }
    bucket.push(line);
  };

  for (const p of runnerParts) {
    if (p.kind !== 'tool-result') continue;
    const out = p.part.output;
    raw.push(out);

    const rec = asRecord(out);
    if (!rec) continue;
    const type = readNonEmptyString(rec.type);
    if (type === 'stdout') {
      const chunk = readNonEmptyString(rec.chunk);
      if (chunk) pushLine(stdout, chunk);
    } else if (type === 'stderr') {
      const chunk = readNonEmptyString(rec.chunk);
      if (chunk) pushLine(stderr, chunk);
    } else if (type === 'progress') {
      const message = readNonEmptyString(rec.message);
      if (message) pushLine(progress, message);
    } else if (type === 'completed') {
      isCompleted = true;
      const ec = rec && typeof rec.exitCode === 'number' ? rec.exitCode : undefined;
      if (typeof ec === 'number') exitCode = ec;
    } else if (type === 'error') {
      hasError = true;
    }
  }

  return {
    command,
    args,
    startedAt: step.startedAt,
    completedAt: step.endedAt,
    exitCode,
    hasError,
    isCompleted,
    stdout,
    stderr,
    progress,
    raw,
    truncated,
  };
}

function summarizeToolCall(toolName: string, input: unknown): string | null {
  const rec = asRecord(input);
  if (!rec) return null;

  if (toolName === 'fs.read') {
    const path = readNonEmptyString(rec.path);
    if (path) return `fs.read ${path}`;
  }

  if (toolName === 'fs.search') {
    const pattern = readNonEmptyString(rec.pattern) ?? '(pattern)';
    const path = readNonEmptyString(rec.path) ?? '.';
    return `fs.search pattern=${pattern} path=${path}`;
  }

  if (toolName === 'shell.exec' || toolName === 'runner.exec') {
    const command = readNonEmptyString(rec.command);
    const args = Array.isArray(rec.args) ? rec.args.map((v) => String(v)) : [];
    if (!command) return null;
    return `${command}${args.length > 0 ? ` ${args.join(' ')}` : ''}`.trim();
  }

  if (toolName === 'git.exec') {
    const args = Array.isArray(rec.args) ? rec.args.map((v) => String(v)) : [];
    if (args.length === 0) return null;
    return `git ${args.join(' ')}`;
  }

  return null;
}

function asRunnerFilesChangedPayload(value: unknown): RunnerFilesChangedPayload | null {
  const rec = asRecord(value);
  if (!rec) return null;
  if (rec.type !== 'runner-files-changed') return null;
  if (rec.version !== 1 || rec.source !== 'runner-host') return null;
  if (!asRecord(rec.summary)) return null;
  if (!Array.isArray(rec.files)) return null;
  return value as RunnerFilesChangedPayload;
}

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatDuration(durationMs: number): string {
  if (durationMs < 1000) return `${durationMs}ms`;
  return `${(durationMs / 1000).toFixed(1)}s`;
}

function truncate(value: string, maxChars: number): string {
  if (value.length <= maxChars) return value;
  return `${value.slice(0, maxChars)}...`;
}

function isRuntimeMetaToolMessage(message: UnifiedMessage): boolean {
  if (message.role !== 'tool') return false;
  if (message.metadata?.isMeta !== true || message.metadata.provider !== 'core-runtime') return false;
  return message.content.some((part) => part.type === 'tool-call' || part.type === 'tool-result');
}

function hasRuntimeTraceMetadata(message: UnifiedMessage): boolean {
  if (!isVisibleAssistantMessage(message)) return false;
  if (message.metadata?.provider !== 'core-runtime') return false;
  const extensions = asRecord(message.metadata.extensions);
  if (!extensions) return false;
  return (
    Array.isArray(extensions.plannedSteps) ||
    Array.isArray(extensions.plannedStepDetails) ||
    typeof extensions.eventCount === 'number' ||
    typeof extensions.runtimeMode === 'string' ||
    typeof extensions.coreSessionId === 'string'
  );
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function readNonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => readNonEmptyString(item)).filter((item): item is string => Boolean(item));
}

const DUMMY_RENDER_MESSAGE: ChatMessage = {
  uuid: 'trace_message',
  parentUuid: null,
  role: 'assistant',
  content: [],
  timestamp: new Date().toISOString(),
  metadata: {
    provider: 'core-runtime',
    modelId: '0',
    extensions: {},
  },
};
