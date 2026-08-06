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

type CodingTaskType = PlanningIntent['codingTaskType'];

interface IntentMetadataOverride {
  wantsModification?: boolean;
  wantsVerification?: boolean;
  isCodingTask?: boolean;
  codingTaskType?: CodingTaskType;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function readCodingTaskType(value: unknown): CodingTaskType | undefined {
  return value === 'bugfix' || value === 'feature' || value === 'refactor' || value === 'generic'
    ? value
    : undefined;
}

function readIntentMetadataOverride(request: AgentRunRequest): IntentMetadataOverride {
  const metadata = request.metadata;
  if (!isRecord(metadata) || !isRecord(metadata.intent)) {
    return {};
  }

  return {
    wantsModification: readBoolean(metadata.intent.wantsModification),
    wantsVerification: readBoolean(metadata.intent.wantsVerification),
    isCodingTask: readBoolean(metadata.intent.isCodingTask),
    codingTaskType: readCodingTaskType(metadata.intent.codingTaskType),
  };
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
    const metadataOverride = readIntentMetadataOverride(request);
    const wantsModification = metadataOverride.wantsModification ?? false;
    const wantsVerification = metadataOverride.wantsVerification ?? false;
    const codingTaskType = metadataOverride.codingTaskType ?? 'generic';
    const complexityScore = this.calculateComplexityScore(raw, context);
    const isCodingTask = this.detectCodingTask(
      semanticStep,
      codingTaskType,
      wantsModification,
      wantsVerification,
      metadataOverride.isCodingTask,
    );

    return {
      inspectionOnly:
        Boolean(semanticStep)
        && !wantsModification
        && !wantsVerification
        && codingTaskType === 'generic'
        && !isCodingTask,
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
    semanticStep: SemanticToolStep | undefined,
    codingTaskType: CodingTaskType,
    wantsModification: boolean,
    wantsVerification: boolean,
    explicitIsCodingTask?: boolean,
  ): boolean {
    if (explicitIsCodingTask !== undefined) {
      return explicitIsCodingTask;
    }

    if (semanticStep) {
      return wantsModification || wantsVerification || codingTaskType !== 'generic';
    }

    return wantsModification || wantsVerification || codingTaskType !== 'generic';
  }

  private calculateComplexityScore(rawMessage: string, context: ContextEnvelope): number {
    const normalized = normalizeWhitespace(rawMessage);
    let score = 0;

    if (normalized.length >= 120) {
      score += 1;
    }
    if (rawMessage.includes('\n')) {
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
