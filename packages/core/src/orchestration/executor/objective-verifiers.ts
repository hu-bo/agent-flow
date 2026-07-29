import type {
  AgentEvent,
  AgentPlan,
  CheckpointRecord,
  CompletionContract,
  ContextEnvelope,
  ObjectiveVerificationContext,
  ObjectiveVerificationResult,
  ObjectiveVerifier,
  StructuredLlmStepOutput,
  AgentRunRequest,
  AgentSession,
} from '../../types/index.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
}

function collectLlmOutputs(outputs: Record<string, unknown>): StructuredLlmStepOutput[] {
  return Object.values(outputs).filter(
    (value): value is StructuredLlmStepOutput =>
      isRecord(value) &&
      value.mode === 'llm-step' &&
      typeof value.stepId === 'string' &&
      typeof value.title === 'string',
  );
}

function collectCompletionSignal(
  outputs: Record<string, unknown>,
  completionContract: CompletionContract,
): boolean {
  const signal = completionContract.completionSignal?.trim();
  if (!signal) {
    return false;
  }

  const normalized = signal.toLowerCase();
  return collectLlmOutputs(outputs).some((output) => {
    if (readString(output.completionSignal)?.toLowerCase() === normalized) {
      return true;
    }
    return output.text.toLowerCase().includes(normalized);
  });
}

function collectEvidenceFromOutputs(outputs: Record<string, unknown>): string[] {
  const evidence: string[] = [];
  for (const output of collectLlmOutputs(outputs)) {
    evidence.push(...readStringArray(output.evidence));
  }
  return evidence;
}

function successfulToolResults(events: AgentEvent[]): AgentEvent[] {
  return events.filter((event) => event.type === 'tool.result' && event.payload.ok === true);
}

function hasUnrecoveredToolFailure(events: AgentEvent[]): boolean {
  const latest = events.filter((event) => event.type === 'tool.result').at(-1);
  return Boolean(latest && latest.payload.ok !== true);
}

function hasSuccessfulRunner(events: AgentEvent[]): boolean {
  return events.some((event) => {
    if (event.type !== 'runner.event' || !isRecord(event.payload.runnerEvent)) return false;
    const runnerEvent = event.payload.runnerEvent;
    return runnerEvent.type === 'completed' && runnerEvent.exitCode === 0;
  });
}

function missingRequiredEvidence(context: ObjectiveVerificationContext): string[] {
  const required = context.completionContract.acceptance.requiredEvidence ?? [];
  const tools = successfulToolResults(context.events);
  const toolNames = new Set(tools.map((event) => readString(event.payload.tool)).filter(Boolean));
  const runnerSuccess = hasSuccessfulRunner(context.events);
  return required.filter((kind) => {
    if (kind === 'tool-success') return tools.length === 0;
    if (kind === 'runner-success') return !runnerSuccess;
    if (kind === 'workspace-inspection') {
      return ![...toolNames].some((name) => name === 'fs.read' || name === 'fs.list' || name === 'fs.search' || name === 'shell.exec');
    }
    if (kind === 'workspace-change') {
      return ![...toolNames].some((name) => name === 'fs.write' || name === 'fs.patch' || name === 'fs.multiPatch');
    }
    if (kind === 'verification') return !runnerSuccess && !toolNames.has('shell.exec');
    return true;
  }).map((kind) => `required:${kind}`);
}

function createVerificationContext(
  plan: AgentPlan,
  request: AgentRunRequest,
  session: AgentSession,
  context: ContextEnvelope,
  outputs: Record<string, unknown>,
  checkpoints: CheckpointRecord[],
  events: AgentEvent[],
  round: number,
): ObjectiveVerificationContext | null {
  if (!plan.completionContract) {
    return null;
  }

  return {
    plan,
    request,
    session,
    context,
    outputs,
    checkpoints,
    events,
    round,
    completionContract: plan.completionContract,
  };
}

class GenericObjectiveVerifier implements ObjectiveVerifier {
  readonly name = 'generic';

  async verify(context: ObjectiveVerificationContext): Promise<ObjectiveVerificationResult> {
    const evidence = collectEvidenceFromOutputs(context.outputs);
    const completionSignalObserved = collectCompletionSignal(context.outputs, context.completionContract);
    const latestLlm = collectLlmOutputs(context.outputs).at(-1);
    const nextAction = readString(latestLlm?.nextAction);
    const incompleteReason = readString(latestLlm?.incompleteReason);

    if (hasUnrecoveredToolFailure(context.events)) {
      return {
        status: 'failed',
        verifierName: this.name,
        reason: 'The latest objective tool action failed.',
        missingEvidence: ['tool-success'],
        evidence,
        nextAction: nextAction ?? 'Execute a different action and collect successful objective evidence.',
        completionSignalObserved,
      };
    }

    if (context.completionContract.acceptance.requireCompletionSignal && !completionSignalObserved) {
      return {
        status: 'failed',
        verifierName: this.name,
        reason: 'Completion signal was required but not observed.',
        missingEvidence: ['completion-signal'],
        evidence,
        nextAction: nextAction ?? 'Ask the model to explicitly self-check completion before ending.',
        completionSignalObserved,
      };
    }

    if (nextAction || incompleteReason) {
      return {
        status: 'failed',
        verifierName: this.name,
        reason: incompleteReason ?? 'The model reported remaining work.',
        missingEvidence: incompleteReason ? ['acceptance'] : [],
        evidence,
        nextAction,
        completionSignalObserved,
      };
    }

    const requiredMissing = missingRequiredEvidence(context);
    if (requiredMissing.length > 0) {
      return {
        status: 'failed',
        verifierName: this.name,
        reason: 'The completion contract is missing required objective evidence.',
        missingEvidence: requiredMissing,
        evidence,
        nextAction: 'Execute the required objective action and verify its result.',
        completionSignalObserved,
      };
    }

    return {
      status: 'passed',
      verifierName: this.name,
      evidence,
      completionSignalObserved,
    };
  }
}

class RepoUnderstandingObjectiveVerifier implements ObjectiveVerifier {
  readonly name = 'repo-understanding';

  async verify(context: ObjectiveVerificationContext): Promise<ObjectiveVerificationResult> {
    const toolResults = successfulToolResults(context.events);
    const repoToolNames = new Set(
      toolResults
        .map((event) => readString(event.payload.tool))
        .filter((tool): tool is string => Boolean(tool)),
    );
    const repoToolEvidencePresent =
      repoToolNames.has('fs.list') &&
      repoToolNames.has('fs.read');

    const summaryOutput = collectLlmOutputs(context.outputs).find((output) => output.title === 'repo.summary');
    const summaryText = readString(summaryOutput?.text) ?? '';
    const evidence = [
      ...collectEvidenceFromOutputs(context.outputs),
      ...toolResults
        .map((event) => {
          const tool = readString(event.payload.tool);
          const stepId = readString(event.payload.stepId);
          return tool ? `${tool}:${stepId ?? event.id}` : undefined;
        })
        .filter((item): item is string => Boolean(item)),
    ];
    const completionSignalObserved = collectCompletionSignal(context.outputs, context.completionContract);
    const nextAction = readString(summaryOutput?.nextAction);
    const incompleteReason = readString(summaryOutput?.incompleteReason);

    const missingEvidence: string[] = [];
    missingEvidence.push(...missingRequiredEvidence(context));
    if (!repoToolEvidencePresent) {
      missingEvidence.push('repo-tool-evidence');
    }
    if (!summaryOutput) {
      missingEvidence.push('repo-summary');
    }
    if (summaryText.length < 24) {
      missingEvidence.push('evidence-based-summary');
    }
    if (evidence.length === 0) {
      missingEvidence.push('quoted-project-evidence');
    }
    if (
      context.completionContract.acceptance.requireCompletionSignal &&
      !completionSignalObserved
    ) {
      missingEvidence.push('completion-signal');
    }
    if (nextAction || incompleteReason) {
      missingEvidence.push('acceptance');
    }

    if (missingEvidence.length > 0) {
      return {
        status: 'failed',
        verifierName: this.name,
        reason:
          incompleteReason ??
          'Repository understanding answer is missing required repo evidence.',
        missingEvidence,
        evidence,
        nextAction:
          nextAction ??
          'Scan/read the repository again and produce a concise summary grounded in actual files.',
        completionSignalObserved,
      };
    }

    return {
      status: 'passed',
      verifierName: this.name,
      evidence,
      completionSignalObserved,
    };
  }
}

function looksLikeVerificationRequest(goal: string): boolean {
  const lowered = goal.toLowerCase();
  return (
    lowered.includes('test') ||
    lowered.includes('build') ||
    lowered.includes('lint') ||
    lowered.includes('verify') ||
    lowered.includes('typecheck') ||
    goal.includes('测试') ||
    goal.includes('构建') ||
    goal.includes('验证') ||
    goal.includes('校验') ||
    goal.includes('类型检查')
  );
}

class CodingObjectiveVerifier implements ObjectiveVerifier {
  readonly name = 'coding';

  async verify(context: ObjectiveVerificationContext): Promise<ObjectiveVerificationResult> {
    const latestLlm = collectLlmOutputs(context.outputs).at(-1);
    const nextAction = readString(latestLlm?.nextAction);
    const incompleteReason = readString(latestLlm?.incompleteReason);
    const evidence = [
      ...collectEvidenceFromOutputs(context.outputs),
      ...successfulToolResults(context.events).map((event) =>
        `tool:${readString(event.payload.tool) ?? 'unknown'}:${readString(event.payload.stepId) ?? event.id}`,
      ),
      ...context.events
        .filter((event) => event.type === 'runner.event')
        .flatMap((event) => {
          const runnerEvent = isRecord(event.payload.runnerEvent) ? event.payload.runnerEvent : null;
          if (!runnerEvent) {
            return [];
          }
          const type = readString(runnerEvent.type);
          if (type !== 'result' && type !== 'completed') {
            return [];
          }
          return [`runner:${readString(event.payload.stepId) ?? event.id}:${type}`];
        }),
    ];
    const completionSignalObserved = collectCompletionSignal(context.outputs, context.completionContract);

    const needsCommandEvidence = looksLikeVerificationRequest(context.request.goal);
    const hasRunnerEvidence = hasSuccessfulRunner(context.events);
    const hasToolEvidence = successfulToolResults(context.events).length > 0;
    const hasObjectiveEvidence = hasRunnerEvidence || hasToolEvidence;
    const missingEvidence: string[] = [];
    missingEvidence.push(...missingRequiredEvidence(context));

    if (hasUnrecoveredToolFailure(context.events)) {
      missingEvidence.push('tool-success');
    }
    if (needsCommandEvidence && !hasObjectiveEvidence) {
      missingEvidence.push('runner-verification');
    }
    if (!needsCommandEvidence && !hasObjectiveEvidence) {
      missingEvidence.push('objective-execution-evidence');
    }
    if (nextAction || incompleteReason) {
      missingEvidence.push('acceptance');
    }
    if (
      context.completionContract.acceptance.requireCompletionSignal &&
      !completionSignalObserved
    ) {
      missingEvidence.push('completion-signal');
    }

    if (missingEvidence.length > 0) {
      return {
        status: 'failed',
        verifierName: this.name,
        reason:
          incompleteReason ??
          (needsCommandEvidence
            ? 'Coding task requires objective verification evidence before completion.'
            : 'Coding task is missing acceptance evidence.'),
        missingEvidence,
        evidence,
        nextAction:
          nextAction ??
          (needsCommandEvidence
            ? 'Run the required verification command and capture its result before finishing.'
            : 'Execute an objective tool action and provide a verifier-backed summary.'),
        completionSignalObserved,
      };
    }

    return {
      status: 'passed',
      verifierName: this.name,
      evidence,
      completionSignalObserved,
    };
  }
}

export class ObjectiveVerifierRegistry {
  private readonly verifiers: Map<string, ObjectiveVerifier>;

  constructor(verifiers: ObjectiveVerifier[] = []) {
    const defaults: ObjectiveVerifier[] = [
      new GenericObjectiveVerifier(),
      new RepoUnderstandingObjectiveVerifier(),
      new CodingObjectiveVerifier(),
    ];
    this.verifiers = new Map(
      [...defaults, ...verifiers].map((verifier) => [verifier.name, verifier]),
    );
  }

  get(name: string): ObjectiveVerifier | undefined {
    return this.verifiers.get(name);
  }

  async verify(args: {
    plan: AgentPlan;
    request: AgentRunRequest;
    session: AgentSession;
    context: ContextEnvelope;
    outputs: Record<string, unknown>;
    checkpoints: CheckpointRecord[];
    events: AgentEvent[];
    round: number;
  }): Promise<ObjectiveVerificationResult | null> {
    const verificationContext = createVerificationContext(
      args.plan,
      args.request,
      args.session,
      args.context,
      args.outputs,
      args.checkpoints,
      args.events,
      args.round,
    );
    if (!verificationContext) {
      return null;
    }

    const verifierName = verificationContext.completionContract.acceptance.verifierName;
    const verifier = this.verifiers.get(verifierName) ?? this.verifiers.get('generic');
    if (!verifier) {
      return null;
    }
    return verifier.verify(verificationContext);
  }
}
