import type { SemanticToolStep } from './semantic-detector.js';
import type { AgentRunRequest, ContextEnvelope } from '../../types/index.js';

export interface PlanningIntent {
  inspectionOnly: boolean;
  wantsVerification: boolean;
  complexityScore: number;
  shouldDecompose: boolean;
  workflow: 'repo-understanding' | 'generic';
  isCodingTask: boolean;
  codingTaskType: 'bugfix' | 'feature' | 'refactor' | 'generic';
}

const ZH_CHANGE_HINTS = ['\u4fee\u590d', '\u4fee\u6539', '\u66f4\u65b0', '\u5b9e\u73b0', '\u91cd\u6784', '\u4f18\u5316', '\u6dfb\u52a0'];
const ZH_VERIFY_HINTS = ['\u6d4b\u8bd5', '\u6821\u9a8c', '\u9a8c\u8bc1', '\u68c0\u67e5'];
const ZH_INSPECTION_HINTS = [
  '\u67e5\u770b',
  '\u770b\u770b',
  '\u770b\u4e0b',
  '\u8bfb\u53d6',
  '\u6253\u5f00',
  '\u641c\u7d22',
  '\u67e5\u627e',
  '\u5217\u51fa',
  '\u76ee\u5f55',
  '\u6587\u4ef6\u5217\u8868',
  '\u6587\u4ef6\u5939',
  '\u684c\u9762',
  '\u6709\u4ec0\u4e48',
];

const EN_CHANGE_HINTS = ['fix', 'implement', 'update', 'refactor', 'optimize', 'add', 'create', 'write'];
const EN_VERIFY_HINTS = ['test', 'verify', 'validate', 'check'];
const EN_BUGFIX_HINTS = ['bug', 'fix', 'error', 'failing', 'broken', 'regression'];
const EN_FEATURE_HINTS = ['feature', 'implement', 'add', 'create', 'support'];
const EN_REFACTOR_HINTS = ['refactor', 'cleanup', 'restructure', 'optimize'];
const EN_CODING_HINTS = [
  'code',
  'file',
  'function',
  'class',
  'typescript',
  'javascript',
  'test',
  'repo',
  'project',
  'compile',
  'build',
  'lint',
];
const ZH_BUGFIX_HINTS = ['bug', '\u62a5\u9519', '\u9519\u8bef', '\u4fee\u590d', '\u5931\u8d25', '\u5f02\u5e38'];
const ZH_FEATURE_HINTS = ['\u529f\u80fd', '\u5b9e\u73b0', '\u65b0\u589e', '\u6dfb\u52a0', '\u652f\u6301'];
const ZH_REFACTOR_HINTS = ['\u91cd\u6784', '\u4f18\u5316', '\u91cd\u5199', '\u6574\u7406'];
const ZH_CODING_HINTS = ['\u4ee3\u7801', '\u6587\u4ef6', '\u51fd\u6570', '\u7c7b', '\u6d4b\u8bd5', '\u5de5\u7a0b', '\u9879\u76ee'];
const EN_INSPECTION_VERBS = /(list|ls|dir|tree|read|open|cat|show|search|find|grep)/i;
const COMPLEXITY_HINTS = ['\n', ' and ', '\u4e14', '\u7136\u540e', ' then ', 'workflow', 'end-to-end', '\u591a\u4e2a'];

const EN_REPO_UNDERSTAND_HINTS = [
  'what is this project',
  'what does this project do',
  'what is this repo',
  'what does this repo do',
  'understand this repo',
  'understand this repository',
  'explain this repo',
  'explain this repository',
  'codebase overview',
  'repository overview',
  'architecture overview',
];

const ZH_REPO_UNDERSTAND_HINTS = [
  '\u8fd9\u4e2a\u9879\u76ee\u662f\u505a\u4ec0\u4e48',
  '\u9879\u76ee\u662f\u505a\u4ec0\u4e48',
  '\u8fd9\u4e2a\u4ed3\u5e93\u662f\u505a\u4ec0\u4e48',
  '\u4ed3\u5e93\u662f\u505a\u4ec0\u4e48',
  '\u7406\u89e3\u8fd9\u4e2a\u9879\u76ee',
  '\u7406\u89e3\u8fd9\u4e2a\u4ed3\u5e93',
  '\u7406\u89e3\u8fd9\u4e2a\u4ee3\u7801\u5e93',
  '\u5de5\u7a0b\u6982\u89c8',
  '\u9879\u76ee\u6982\u89c8',
  '\u4ed3\u5e93\u6982\u89c8',
  '\u6574\u4f53\u67b6\u6784',
];

function includesAny(haystack: string, needles: readonly string[]): boolean {
  return needles.some((needle) => haystack.includes(needle));
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function extractRequestMessage(request: AgentRunRequest): string {
  return typeof request.metadata?.userMessage === 'string' ? request.metadata.userMessage : request.goal;
}

export class PlanningIntentResolver {
  resolve(request: AgentRunRequest, context: ContextEnvelope, semanticStep?: SemanticToolStep): PlanningIntent {
    const raw = extractRequestMessage(request);
    const lowered = normalizeWhitespace(raw).toLowerCase();

    const wantsModification =
      EN_CHANGE_HINTS.some((hint) => lowered.includes(hint)) || includesAny(raw, ZH_CHANGE_HINTS);
    const wantsVerification =
      EN_VERIFY_HINTS.some((hint) => lowered.includes(hint)) || includesAny(raw, ZH_VERIFY_HINTS);

    const codingTaskType = this.detectCodingTaskType(raw, lowered);
    const hasInspectionVerb = EN_INSPECTION_VERBS.test(raw) || includesAny(raw, ZH_INSPECTION_HINTS);
    const complexityScore = this.calculateComplexityScore(raw, context);
    const workflow = this.detectWorkflow(raw, lowered);
    const isCodingTask = this.detectCodingTask(
      raw,
      lowered,
      request,
      semanticStep,
      workflow,
      codingTaskType,
      wantsModification,
      wantsVerification,
    );

    return {
      inspectionOnly: Boolean(semanticStep) && hasInspectionVerb && !wantsModification,
      wantsVerification,
      complexityScore,
      shouldDecompose:
        request.strategy === 'tree' ||
        request.strategy === 'react' ||
        complexityScore >= 2 ||
        (wantsModification && wantsVerification),
      workflow,
      isCodingTask,
      codingTaskType,
    };
  }

  private detectWorkflow(raw: string, lowered: string): PlanningIntent['workflow'] {
    if (EN_REPO_UNDERSTAND_HINTS.some((hint) => lowered.includes(hint)) || includesAny(raw, ZH_REPO_UNDERSTAND_HINTS)) {
      return 'repo-understanding';
    }

    // Generic heuristic: questions that explicitly ask for "what this project/repo does" or "architecture" often
    // mean repository understanding, even if they don't include the exact phrases above.
    const likelyRepoNouns =
      lowered.includes('repo') ||
      lowered.includes('repository') ||
      lowered.includes('codebase') ||
      lowered.includes('project') ||
      includesAny(raw, ['\u9879\u76ee', '\u4ed3\u5e93', '\u4ee3\u7801\u5e93']);
    const likelyUnderstandVerbs =
      lowered.includes('understand') ||
      lowered.includes('explain') ||
      lowered.includes('overview') ||
      lowered.includes('architecture') ||
      includesAny(raw, ['\u7406\u89e3', '\u4ecb\u7ecd', '\u6982\u89c8', '\u67b6\u6784', '\u662f\u505a\u4ec0\u4e48', '\u7528\u9014']);

    if (likelyRepoNouns && likelyUnderstandVerbs) {
      return 'repo-understanding';
    }

    return 'generic';
  }

  private detectCodingTask(
    raw: string,
    lowered: string,
    request: AgentRunRequest,
    semanticStep: SemanticToolStep | undefined,
    workflow: PlanningIntent['workflow'],
    codingTaskType: 'bugfix' | 'feature' | 'refactor' | 'generic',
    wantsModification: boolean,
    wantsVerification: boolean,
  ): boolean {
    if (workflow === 'repo-understanding') {
      // Repository understanding is an analysis workflow, not a coding workflow,
      // unless the user explicitly asks to modify/verify code.
      if (!wantsModification && !wantsVerification && codingTaskType === 'generic') {
        return false;
      }
    }

    if (semanticStep) {
      return wantsModification || wantsVerification || codingTaskType !== 'generic';
    }

    if (codingTaskType !== 'generic') {
      return true;
    }

    if (EN_CODING_HINTS.some((hint) => lowered.includes(hint)) || includesAny(raw, ZH_CODING_HINTS)) {
      return true;
    }

    const hasCodeLikeContext = (request.initialContext ?? []).some((fragment) => {
      const source = fragment.source.toLowerCase();
      return (
        source.includes('file') ||
        source.includes('code') ||
        source.endsWith('.ts') ||
        source.endsWith('.tsx') ||
        source.endsWith('.js') ||
        source.endsWith('.jsx') ||
        source.endsWith('.go')
      );
    });
    return hasCodeLikeContext;
  }

  private detectCodingTaskType(
    raw: string,
    lowered: string
  ): 'bugfix' | 'feature' | 'refactor' | 'generic' {
    if (EN_BUGFIX_HINTS.some((hint) => lowered.includes(hint)) || includesAny(raw, ZH_BUGFIX_HINTS)) {
      return 'bugfix';
    }
    if (EN_REFACTOR_HINTS.some((hint) => lowered.includes(hint)) || includesAny(raw, ZH_REFACTOR_HINTS)) {
      return 'refactor';
    }
    if (EN_FEATURE_HINTS.some((hint) => lowered.includes(hint)) || includesAny(raw, ZH_FEATURE_HINTS)) {
      return 'feature';
    }
    return 'generic';
  }

  private calculateComplexityScore(rawMessage: string, context: ContextEnvelope): number {
    const normalized = normalizeWhitespace(rawMessage);
    const lowered = normalized.toLowerCase();
    let score = 0;

    if (normalized.length >= 120) {
      score += 1;
    }
    if (COMPLEXITY_HINTS.some((hint) => normalized.includes(hint) || lowered.includes(hint))) {
      score += 1;
    }
    if (/[1-9][\).\u3001]/.test(normalized)) {
      score += 1;
    }
    if (context.truncated || context.fragments.length >= 5) {
      score += 1;
    }

    return score;
  }
}
