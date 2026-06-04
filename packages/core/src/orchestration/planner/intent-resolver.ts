import type { SemanticToolStep } from './semantic-detector.js';
import type { AgentRunRequest, ContextEnvelope } from '../../types/index.js';

export interface PlanningIntent {
  inspectionOnly: boolean;
  wantsModification: boolean;
  wantsVerification: boolean;
  complexityScore: number;
  shouldDecompose: boolean;
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
  'compile',
  'build',
  'lint',
];
const ZH_BUGFIX_HINTS = ['bug', '\u62a5\u9519', '\u9519\u8bef', '\u4fee\u590d', '\u5931\u8d25', '\u5f02\u5e38'];
const ZH_FEATURE_HINTS = ['\u529f\u80fd', '\u5b9e\u73b0', '\u65b0\u589e', '\u6dfb\u52a0', '\u652f\u6301'];
const ZH_REFACTOR_HINTS = ['\u91cd\u6784', '\u4f18\u5316', '\u91cd\u5199', '\u6574\u7406'];
const ZH_CODING_HINTS = ['\u4ee3\u7801', '\u6587\u4ef6', '\u51fd\u6570', '\u7c7b', '\u6d4b\u8bd5'];
const EN_INSPECTION_VERBS = /(list|ls|dir|tree|read|open|cat|show|search|find|grep)/i;
const COMPLEXITY_HINTS = ['\n', ' and ', '\u4e14', '\u7136\u540e', ' then ', 'workflow', 'end-to-end', '\u591a\u4e2a'];

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
    const isCodingTask = this.detectCodingTask(
      raw,
      lowered,
      request,
      semanticStep,
      codingTaskType,
      wantsModification,
      wantsVerification,
    );

    return {
      inspectionOnly: Boolean(semanticStep) && hasInspectionVerb && !wantsModification,
      wantsModification,
      wantsVerification,
      complexityScore,
      shouldDecompose:
        request.strategy === 'tree' ||
        request.strategy === 'react' ||
        complexityScore >= 2 ||
        (wantsModification && wantsVerification),
      isCodingTask,
      codingTaskType,
    };
  }

  private detectCodingTask(
    raw: string,
    lowered: string,
    request: AgentRunRequest,
    semanticStep: SemanticToolStep | undefined,
    codingTaskType: 'bugfix' | 'feature' | 'refactor' | 'generic',
    wantsModification: boolean,
    wantsVerification: boolean,
  ): boolean {
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
