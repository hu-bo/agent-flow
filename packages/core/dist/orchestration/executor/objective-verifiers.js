function isRecord(value) {
    return typeof value === 'object' && value !== null;
}
function readString(value) {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}
function readStringArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter((item) => item.length > 0);
}
function collectLlmOutputs(outputs) {
    return Object.values(outputs).filter((value) => isRecord(value) &&
        value.mode === 'llm-step' &&
        typeof value.stepId === 'string' &&
        typeof value.title === 'string');
}
function collectCompletionSignal(outputs, completionContract) {
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
function collectEvidenceFromOutputs(outputs) {
    const evidence = [];
    for (const output of collectLlmOutputs(outputs)) {
        evidence.push(...readStringArray(output.evidence));
    }
    return evidence;
}
function createVerificationContext(plan, request, session, context, outputs, checkpoints, events, round) {
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
class GenericObjectiveVerifier {
    name = 'generic';
    async verify(context) {
        const evidence = collectEvidenceFromOutputs(context.outputs);
        const completionSignalObserved = collectCompletionSignal(context.outputs, context.completionContract);
        const latestLlm = collectLlmOutputs(context.outputs).at(-1);
        const nextAction = readString(latestLlm?.nextAction);
        const incompleteReason = readString(latestLlm?.incompleteReason);
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
        return {
            status: 'passed',
            verifierName: this.name,
            evidence,
            completionSignalObserved,
        };
    }
}
class RepoUnderstandingObjectiveVerifier {
    name = 'repo-understanding';
    async verify(context) {
        const toolResults = context.events.filter((event) => event.type === 'tool.result');
        const repoToolNames = new Set(toolResults
            .map((event) => readString(event.payload.tool))
            .filter((tool) => Boolean(tool)));
        const repoToolEvidencePresent = repoToolNames.has('fs.list') &&
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
                .filter((item) => Boolean(item)),
        ];
        const completionSignalObserved = collectCompletionSignal(context.outputs, context.completionContract);
        const nextAction = readString(summaryOutput?.nextAction);
        const incompleteReason = readString(summaryOutput?.incompleteReason);
        const missingEvidence = [];
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
        if (context.completionContract.acceptance.requireCompletionSignal &&
            !completionSignalObserved) {
            missingEvidence.push('completion-signal');
        }
        if (nextAction || incompleteReason) {
            missingEvidence.push('acceptance');
        }
        if (missingEvidence.length > 0) {
            return {
                status: 'failed',
                verifierName: this.name,
                reason: incompleteReason ??
                    'Repository understanding answer is missing required repo evidence.',
                missingEvidence,
                evidence,
                nextAction: nextAction ??
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
function looksLikeVerificationRequest(goal) {
    const lowered = goal.toLowerCase();
    return (lowered.includes('test') ||
        lowered.includes('build') ||
        lowered.includes('lint') ||
        lowered.includes('verify') ||
        lowered.includes('typecheck') ||
        goal.includes('测试') ||
        goal.includes('构建') ||
        goal.includes('验证') ||
        goal.includes('校验') ||
        goal.includes('类型检查'));
}
class CodingObjectiveVerifier {
    name = 'coding';
    async verify(context) {
        const latestLlm = collectLlmOutputs(context.outputs).at(-1);
        const nextAction = readString(latestLlm?.nextAction);
        const incompleteReason = readString(latestLlm?.incompleteReason);
        const evidence = [
            ...collectEvidenceFromOutputs(context.outputs),
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
        const hasRunnerEvidence = context.events.some((event) => event.type === 'runner.event');
        const hasCheckpointEvidence = context.checkpoints.length > 0;
        const missingEvidence = [];
        if (needsCommandEvidence && !hasRunnerEvidence) {
            missingEvidence.push('runner-verification');
        }
        if (!needsCommandEvidence && !hasCheckpointEvidence) {
            missingEvidence.push('checkpoint-evidence');
        }
        if (nextAction || incompleteReason) {
            missingEvidence.push('acceptance');
        }
        if (context.completionContract.acceptance.requireCompletionSignal &&
            !completionSignalObserved) {
            missingEvidence.push('completion-signal');
        }
        if (missingEvidence.length > 0) {
            return {
                status: 'failed',
                verifierName: this.name,
                reason: incompleteReason ??
                    (needsCommandEvidence
                        ? 'Coding task requires objective verification evidence before completion.'
                        : 'Coding task is missing acceptance evidence.'),
                missingEvidence,
                evidence,
                nextAction: nextAction ??
                    (needsCommandEvidence
                        ? 'Run the required verification command and capture its result before finishing.'
                        : 'Provide a clearer completion check or checkpoint-backed verification summary.'),
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
    verifiers;
    constructor(verifiers = []) {
        const defaults = [
            new GenericObjectiveVerifier(),
            new RepoUnderstandingObjectiveVerifier(),
            new CodingObjectiveVerifier(),
        ];
        this.verifiers = new Map([...defaults, ...verifiers].map((verifier) => [verifier.name, verifier]));
    }
    get(name) {
        return this.verifiers.get(name);
    }
    async verify(args) {
        const verificationContext = createVerificationContext(args.plan, args.request, args.session, args.context, args.outputs, args.checkpoints, args.events, args.round);
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
//# sourceMappingURL=objective-verifiers.js.map