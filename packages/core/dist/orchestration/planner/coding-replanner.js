import { PlanningIntentResolver, extractRequestMessage } from './intent-resolver.js';
import { SemanticFsDetector } from './semantic-detector.js';
let replanCounter = 0;
let replanStepCounter = 0;
function nextReplanId() {
    replanCounter += 1;
    return `replan_${Date.now()}_${replanCounter}`;
}
function nextReplanStepId() {
    replanStepCounter += 1;
    return `replan_step_${Date.now()}_${replanStepCounter}`;
}
const semanticFsDetector = new SemanticFsDetector();
const intentResolver = new PlanningIntentResolver();
function classifyErrorCategory(error) {
    const lowered = error.toLowerCase();
    if (lowered.includes('enoent') ||
        lowered.includes('not found') ||
        lowered.includes('no such file') ||
        lowered.includes('cannot find')) {
        return 'not-found';
    }
    if (lowered.includes('permission') ||
        lowered.includes('eacces') ||
        lowered.includes('denied') ||
        lowered.includes('forbidden')) {
        return 'permission';
    }
    if (lowered.includes('timeout') ||
        lowered.includes('timed out') ||
        lowered.includes('deadline exceeded')) {
        return 'timeout';
    }
    if (lowered.includes('invalid') ||
        lowered.includes('schema') ||
        lowered.includes('parse') ||
        lowered.includes('syntax')) {
        return 'validation';
    }
    return 'unknown';
}
function detectRecoveryStrategy(ctx) {
    if (ctx.failedStep.kind === 'tool' && typeof ctx.failedStep.toolName === 'string') {
        if (ctx.failedStep.toolName.startsWith('fs.')) {
            return 'fs-diagnostics';
        }
        if (ctx.failedStep.toolName.startsWith('shell.')) {
            return 'shell-diagnostics';
        }
    }
    if (ctx.failedStep.kind === 'runner') {
        return 'shell-diagnostics';
    }
    return 'generic';
}
function toDiagnosticsPath(raw) {
    if (typeof raw !== 'string' || raw.trim().length === 0) {
        return '.';
    }
    const value = raw.trim().replace(/\\/g, '/');
    if (value.endsWith('/')) {
        return value;
    }
    const slashIndex = value.lastIndexOf('/');
    if (slashIndex <= 0) {
        return '.';
    }
    return value.slice(0, slashIndex);
}
function resolveWorkingDir(ctx) {
    const metadata = ctx.request.metadata ?? {};
    const candidates = [metadata.cwd, metadata.workingDir, metadata.sessionCwd];
    for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.trim().length > 0) {
            return candidate.trim();
        }
    }
    return '.';
}
export class CodingReplanner {
    async replan(ctx) {
        const rawMessage = extractRequestMessage(ctx.request);
        const semanticStep = semanticFsDetector.detect(rawMessage);
        const intent = intentResolver.resolve(ctx.request, ctx.context, semanticStep);
        if (!intent.isCodingTask) {
            return undefined;
        }
        const errorCategory = classifyErrorCategory(ctx.error);
        const recoveryStrategy = detectRecoveryStrategy(ctx);
        const steps = [];
        let diagnosticsStepId;
        let diagnosticsConsumeKey;
        if (recoveryStrategy === 'fs-diagnostics') {
            diagnosticsStepId = nextReplanStepId();
            diagnosticsConsumeKey = 'fsDiagnostics';
            const diagnosticsPath = toDiagnosticsPath((ctx.failedStep.input ?? {}).path);
            steps.push({
                id: diagnosticsStepId,
                title: 'replan-fs-diagnostics',
                kind: 'tool',
                dependsOn: [],
                toolName: 'fs.list',
                input: {
                    path: diagnosticsPath,
                    recursive: false,
                    includeHidden: true,
                    maxEntries: 120,
                },
            });
        }
        else if (recoveryStrategy === 'shell-diagnostics') {
            diagnosticsStepId = nextReplanStepId();
            diagnosticsConsumeKey = 'shellDiagnostics';
            steps.push({
                id: diagnosticsStepId,
                title: 'replan-shell-diagnostics',
                kind: 'tool',
                dependsOn: [],
                toolName: 'shell.exec',
                input: {
                    command: 'pwd',
                    args: [],
                    timeoutMs: 5000,
                    workingDir: resolveWorkingDir(ctx),
                },
            });
        }
        const analysisStepId = nextReplanStepId();
        const implementationStepId = nextReplanStepId();
        const verificationStepId = nextReplanStepId();
        steps.push({
            id: analysisStepId,
            title: 'replan-coding-analysis',
            kind: 'llm',
            dependsOn: diagnosticsStepId ? [diagnosticsStepId] : [],
            consumes: diagnosticsStepId
                ? {
                    [diagnosticsConsumeKey ?? 'diagnostics']: diagnosticsStepId,
                }
                : {},
            input: {
                goal: ctx.request.goal,
                mode: 'failure-analysis',
                attempt: ctx.attempt,
                error: ctx.error,
                errorCategory,
                recoveryStrategy,
                failedStep: {
                    id: ctx.failedStep.id,
                    title: ctx.failedStep.title,
                    kind: ctx.failedStep.kind,
                    toolName: ctx.failedStep.toolName,
                },
                availableOutputStepIds: Object.keys(ctx.outputs),
            },
        });
        steps.push({
            id: implementationStepId,
            title: 'replan-coding-implementation',
            kind: 'llm',
            dependsOn: [analysisStepId],
            consumes: {
                diagnosis: analysisStepId,
                ...(diagnosticsStepId
                    ? {
                        [diagnosticsConsumeKey ?? 'diagnostics']: diagnosticsStepId,
                    }
                    : {}),
            },
            input: {
                goal: ctx.request.goal,
                mode: 'recovery-implementation',
                taskType: intent.codingTaskType,
                recoveryStrategy,
                previousFailedStepId: ctx.failedStep.id,
                previousFailedStepKind: ctx.failedStep.kind,
            },
        });
        steps.push({
            id: verificationStepId,
            title: 'replan-coding-verification',
            kind: 'llm',
            dependsOn: [implementationStepId],
            consumes: {
                implementation: implementationStepId,
                diagnosis: analysisStepId,
            },
            input: {
                goal: ctx.request.goal,
                mode: 'recovery-verification',
                taskType: intent.codingTaskType,
                recoveryStrategy,
                errorCategory,
                previousError: ctx.error,
            },
        });
        return {
            id: nextReplanId(),
            strategy: ctx.failedPlan.strategy,
            metadata: {
                source: 'coding-replanner',
                attempt: ctx.attempt,
                previousPlanId: ctx.failedPlan.id,
                failedStepId: ctx.failedStep.id,
                recoveryStrategy,
                errorCategory,
            },
            steps,
        };
    }
}
//# sourceMappingURL=coding-replanner.js.map