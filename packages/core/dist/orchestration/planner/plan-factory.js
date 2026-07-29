const STEP_TITLES = {
    runner: 'runner-execution',
    directReasoning: 'llm-reasoning',
    taskAnalysis: 'task-analysis',
    taskExecution: 'task-execution',
    solutionExecution: 'solution-execution',
    qualityVerification: 'quality-verification',
    solutionVerification: 'solution-verification',
    codingAnalysis: 'coding-analysis',
    codingImplementation: 'coding-implementation',
    codingBugfixValidation: 'coding-bugfix-validation',
    codingFeatureValidation: 'coding-feature-validation',
    codingRefactorValidation: 'coding-refactor-validation',
    codingValidation: 'coding-validation',
};
let planCounter = 0;
let stepCounter = 0;
function nextPlanId() {
    planCounter += 1;
    return `plan_${Date.now()}_${planCounter}`;
}
function nextStepId() {
    stepCounter += 1;
    return `step_${Date.now()}_${stepCounter}`;
}
function normalizeStep(step) {
    return {
        ...step,
        id: step.id || nextStepId(),
        title: step.title || step.id || 'unnamed-step',
        dependsOn: step.dependsOn ?? [],
        consumes: step.consumes ?? {},
    };
}
function resolveTaskSpecificValidationSpec(taskType) {
    if (taskType === 'bugfix') {
        return {
            title: STEP_TITLES.codingBugfixValidation,
            mode: 'regression-validation',
        };
    }
    if (taskType === 'feature') {
        return {
            title: STEP_TITLES.codingFeatureValidation,
            mode: 'acceptance-validation',
        };
    }
    if (taskType === 'refactor') {
        return {
            title: STEP_TITLES.codingRefactorValidation,
            mode: 'behavior-preservation-validation',
        };
    }
    return undefined;
}
export class PlanFactory {
    normalize(request) {
        if (!request.plan) {
            return undefined;
        }
        return {
            ...request.plan,
            id: request.plan.id || nextPlanId(),
            strategy: request.plan.strategy || request.strategy || 'plan',
            steps: request.plan.steps.map((step) => normalizeStep(step)),
            completionContract: request.plan.completionContract ?? {
                objective: request.goal,
                completionSignal: 'COMPLETE',
                maxRounds: 3,
                acceptance: { verifierName: 'generic' },
            },
        };
    }
    runner(request) {
        return this.build(request.strategy, [
            {
                id: nextStepId(),
                title: STEP_TITLES.runner,
                kind: 'runner',
                dependsOn: [],
                runner: {
                    command: request.runnerCommand,
                    args: request.runnerArgs ?? [],
                    stream: true,
                },
                input: {
                    goal: request.goal,
                },
            },
        ], {
            workflow: 'runner',
            thinkingPath: ['plan', 'implementation', 'verification'],
        }, {
            objective: request.goal,
            completionSignal: 'COMPLETE',
            maxRounds: 1,
            acceptance: {
                verifierName: 'generic',
                requiredEvidence: ['runner-success'],
            },
        });
    }
    semanticInspection(request, semanticStep) {
        return this.build(request.strategy, [
            {
                id: nextStepId(),
                title: semanticStep.title,
                kind: 'tool',
                dependsOn: [],
                toolName: semanticStep.toolName,
                input: semanticStep.input,
            },
        ], {
            workflow: 'tool-inspection',
            thinkingPath: ['plan', 'tool-evidence', 'final'],
        }, {
            objective: request.goal,
            completionSignal: 'COMPLETE',
            maxRounds: 1,
            acceptance: {
                verifierName: 'generic',
                requiredEvidence: ['tool-success'],
            },
        });
    }
    toolFirstExecution(request, semanticStep, intent) {
        const discoverId = nextStepId();
        const executeId = nextStepId();
        const steps = [
            {
                id: discoverId,
                title: semanticStep.title,
                kind: 'tool',
                dependsOn: [],
                toolName: semanticStep.toolName,
                input: semanticStep.input,
            },
            {
                id: executeId,
                title: STEP_TITLES.taskExecution,
                kind: 'llm',
                dependsOn: [discoverId],
                consumes: {
                    discovery: discoverId,
                },
                input: {
                    goal: request.goal,
                    mode: 'tool-first',
                    complexity: intent.complexityScore,
                },
            },
        ];
        if (intent.wantsVerification) {
            steps.push({
                id: nextStepId(),
                title: STEP_TITLES.qualityVerification,
                kind: 'llm',
                dependsOn: [executeId],
                input: {
                    goal: request.goal,
                    mode: 'verification',
                },
            });
        }
        return this.build(request.strategy, steps, {
            workflow: 'tool-first',
            complexityScore: intent.complexityScore,
            thinkingPath: ['plan', 'tool-evidence', 'implementation', 'verification'],
        }, {
            objective: request.goal,
            completionSignal: 'COMPLETE',
            maxRounds: 2,
            acceptance: {
                verifierName: 'generic',
                requiredEvidence: ['tool-success'],
            },
        });
    }
    repoUnderstandingExecution(request, intent) {
        const listRootId = nextStepId();
        const readmeId = nextStepId();
        const pkgId = nextStepId();
        const workspaceId = nextStepId();
        const turboId = nextStepId();
        const analysisId = nextStepId();
        const summaryId = nextStepId();
        const steps = [
            {
                id: listRootId,
                title: 'repo.scan',
                kind: 'tool',
                dependsOn: [],
                toolName: 'fs.list',
                input: {
                    path: '.',
                    recursive: false,
                    maxEntries: 200,
                    includeHidden: false,
                },
            },
            {
                id: readmeId,
                title: 'repo.read_readme',
                kind: 'tool',
                dependsOn: [],
                toolName: 'fs.read',
                input: {
                    path: 'README.md',
                    maxBytes: 200_000,
                    allowMissing: true,
                },
            },
            {
                id: pkgId,
                title: 'repo.read_package_json',
                kind: 'tool',
                dependsOn: [],
                toolName: 'fs.read',
                input: {
                    path: 'package.json',
                    maxBytes: 200_000,
                    allowMissing: true,
                },
            },
            {
                id: workspaceId,
                title: 'repo.read_pnpm_workspace',
                kind: 'tool',
                dependsOn: [],
                toolName: 'fs.read',
                input: {
                    path: 'pnpm-workspace.yaml',
                    maxBytes: 200_000,
                    allowMissing: true,
                },
            },
            {
                id: turboId,
                title: 'repo.read_turbo',
                kind: 'tool',
                dependsOn: [],
                toolName: 'fs.read',
                input: {
                    path: 'turbo.json',
                    maxBytes: 200_000,
                    allowMissing: true,
                },
            },
            {
                id: analysisId,
                title: 'repo.analysis',
                kind: 'llm',
                dependsOn: [listRootId, readmeId, pkgId, workspaceId, turboId],
                consumes: {
                    repoTree: listRootId,
                    readme: readmeId,
                    packageJson: pkgId,
                    pnpmWorkspace: workspaceId,
                    turbo: turboId,
                },
                input: {
                    goal: request.goal,
                    mode: 'repo-analysis',
                    complexity: intent.complexityScore,
                },
            },
            {
                id: summaryId,
                title: 'repo.summary',
                kind: 'llm',
                dependsOn: [analysisId],
                consumes: {
                    analysis: analysisId,
                },
                input: {
                    goal: request.goal,
                    mode: 'repo-summary',
                },
            },
        ];
        return this.build(request.strategy, steps, {
            workflow: 'repo-understanding',
            complexityScore: intent.complexityScore,
            thinkingPath: ['plan', 'tool-evidence', 'analysis', 'final'],
        }, {
            objective: request.goal,
            completionSignal: 'COMPLETE',
            maxRounds: 3,
            acceptance: {
                verifierName: 'repo-understanding',
                requiredEvidence: ['workspace-inspection'],
            },
        });
    }
    codingExecution(request, intent, semanticStep) {
        const steps = [];
        let discoveryStepId;
        if (semanticStep) {
            discoveryStepId = nextStepId();
            steps.push({
                id: discoveryStepId,
                title: semanticStep.title,
                kind: 'tool',
                dependsOn: [],
                toolName: semanticStep.toolName,
                input: semanticStep.input,
            });
        }
        const analysisStepId = nextStepId();
        const implementationStepId = nextStepId();
        const validationStepId = nextStepId();
        steps.push({
            id: analysisStepId,
            title: STEP_TITLES.codingAnalysis,
            kind: 'llm',
            dependsOn: discoveryStepId ? [discoveryStepId] : [],
            consumes: discoveryStepId
                ? {
                    discovery: discoveryStepId,
                }
                : {},
            input: {
                goal: request.goal,
                mode: 'analysis',
                domain: 'software-engineering',
                taskType: intent.codingTaskType,
                complexity: intent.complexityScore,
            },
        });
        steps.push({
            id: implementationStepId,
            title: STEP_TITLES.codingImplementation,
            kind: 'llm',
            dependsOn: [analysisStepId],
            consumes: {
                analysis: analysisStepId,
                ...(discoveryStepId
                    ? {
                        discovery: discoveryStepId,
                    }
                    : {}),
            },
            input: {
                goal: request.goal,
                mode: 'implementation',
                domain: 'software-engineering',
                taskType: intent.codingTaskType,
            },
        });
        const taskSpecificValidationSpec = resolveTaskSpecificValidationSpec(intent.codingTaskType);
        let finalValidationDependsOn = implementationStepId;
        const finalValidationConsumes = {
            implementation: implementationStepId,
        };
        if (taskSpecificValidationSpec) {
            const taskSpecificValidationStepId = nextStepId();
            steps.push({
                id: taskSpecificValidationStepId,
                title: taskSpecificValidationSpec.title,
                kind: 'llm',
                dependsOn: [implementationStepId],
                consumes: {
                    implementation: implementationStepId,
                    analysis: analysisStepId,
                },
                input: {
                    goal: request.goal,
                    mode: taskSpecificValidationSpec.mode,
                    domain: 'software-engineering',
                    taskType: intent.codingTaskType,
                },
            });
            finalValidationDependsOn = taskSpecificValidationStepId;
            finalValidationConsumes.taskValidation = taskSpecificValidationStepId;
        }
        steps.push({
            id: validationStepId,
            title: STEP_TITLES.codingValidation,
            kind: 'llm',
            dependsOn: [finalValidationDependsOn],
            consumes: finalValidationConsumes,
            input: {
                goal: request.goal,
                mode: 'validation',
                domain: 'software-engineering',
                taskType: intent.codingTaskType,
                verifyDepth: intent.wantsVerification ? 'full' : 'standard',
            },
        });
        return this.build(request.strategy, steps, {
            workflow: 'coding',
            taskType: intent.codingTaskType,
            complexityScore: intent.complexityScore,
            thinkingPath: ['plan', 'analysis', 'implementation', 'verification'],
        }, {
            objective: request.goal,
            completionSignal: 'COMPLETE',
            maxRounds: 3,
            acceptance: {
                verifierName: 'coding',
                requiredEvidence: ['tool-success'],
            },
        });
    }
    decomposedExecution(request, intent) {
        const analysisId = nextStepId();
        const executionId = nextStepId();
        const steps = [
            {
                id: analysisId,
                title: STEP_TITLES.taskAnalysis,
                kind: 'llm',
                dependsOn: [],
                input: {
                    goal: request.goal,
                    mode: 'analysis',
                    strategy: request.strategy ?? 'plan',
                    complexity: intent.complexityScore,
                },
            },
            {
                id: executionId,
                title: STEP_TITLES.solutionExecution,
                kind: 'llm',
                dependsOn: [analysisId],
                consumes: {
                    analysis: analysisId,
                },
                input: {
                    goal: request.goal,
                    mode: 'execution',
                },
            },
        ];
        if (intent.wantsVerification) {
            const verificationId = nextStepId();
            steps.push({
                id: verificationId,
                title: STEP_TITLES.solutionVerification,
                kind: 'llm',
                dependsOn: [executionId],
                consumes: {
                    execution: executionId,
                    analysis: analysisId,
                },
                input: {
                    goal: request.goal,
                    mode: 'verification',
                },
            });
        }
        return this.build(request.strategy, steps, {
            workflow: 'decomposed',
            complexityScore: intent.complexityScore,
            thinkingPath: ['plan', 'analysis', 'implementation', 'verification'],
        }, {
            objective: request.goal,
            completionSignal: 'COMPLETE',
            maxRounds: 2,
            acceptance: {
                verifierName: 'generic',
            },
        });
    }
    direct(request) {
        return this.build(request.strategy, [
            {
                id: nextStepId(),
                title: STEP_TITLES.directReasoning,
                kind: 'llm',
                dependsOn: [],
                input: {
                    goal: request.goal,
                },
            },
        ], {
            workflow: 'direct',
            thinkingPath: ['intent', 'answer'],
        }, {
            objective: request.goal,
            completionSignal: 'COMPLETE',
            maxRounds: 1,
            acceptance: {
                verifierName: 'generic',
            },
        });
    }
    build(strategy, steps, metadata = {}, completionContract) {
        return {
            id: nextPlanId(),
            strategy: strategy ?? 'plan',
            steps,
            metadata,
            completionContract,
        };
    }
}
//# sourceMappingURL=plan-factory.js.map