import type { AgentPlan, AgentRunRequest, AgentStep, ContextEnvelope, Planner } from '../../types/index.js';

let planCounter = 0;
let stepCounter = 0;

function nextPlanId(): string {
  planCounter += 1;
  return `plan_${Date.now()}_${planCounter}`;
}

function nextStepId(): string {
  stepCounter += 1;
  return `step_${Date.now()}_${stepCounter}`;
}

function normalizeStep(step: AgentStep): AgentStep {
  return {
    ...step,
    id: step.id || nextStepId(),
    title: step.title || step.id || 'unnamed-step',
    dependsOn: step.dependsOn ?? []
  };
}

export interface SemanticToolStep {
  title: string;
  toolName: 'fs.read' | 'fs.list' | 'fs.search';
  input: Record<string, unknown>;
}

const ZH_READ_KEYWORDS = [
  '\u67e5\u770b',
  '\u770b\u770b',
  '\u770b\u4e0b',
  '\u8bfb\u53d6',
  '\u6253\u5f00',
] as const;
const ZH_SEARCH_KEYWORDS = ['\u641c\u7d22', '\u67e5\u627e'] as const;
const ZH_LIST_KEYWORDS = [
  '\u5217\u51fa',
  '\u76ee\u5f55',
  '\u6587\u4ef6\u5217\u8868',
  '\u6587\u4ef6\u5939',
  '\u684c\u9762',
] as const;
const ZH_RECURSIVE_KEYWORDS = ['\u9012\u5f52', '\u5168\u5c40', '\u5168\u91cf'] as const;
const ZH_FILE_NOUNS = ['\u6587\u4ef6', '\u6587\u4ef6\u5939', '\u76ee\u5f55'] as const;

function includesAny(haystack: string, needles: readonly string[]): boolean {
  return needles.some((needle) => haystack.includes(needle));
}

function resolveSemanticPathCandidate(message: string, candidatePath: string): string {
  if (candidatePath.length > 0) {
    return candidatePath;
  }

  if (includesAny(message, ['\u684c\u9762', 'Desktop', 'desktop'])) {
    // Keep semantic fs operations inside workspace scope when user requests Desktop.
    return '.';
  }

  return '';
}

export function detectSemanticToolStep(rawMessage: string): SemanticToolStep | undefined {
  const message = rawMessage.trim();
  if (!message) {
    return undefined;
  }

  const lowered = message.toLowerCase();
  const quotedPath = message.match(/`([^`]+)`/)?.[1];
  const genericPath = message.match(/[A-Za-z]:\\[^\s"'`]+|\.{0,2}[\\/][^\s"'`]+|[A-Za-z0-9._-]+[\\/][^\s"'`]+/)?.[0];
  const explicitCandidatePath = (quotedPath ?? genericPath ?? '').trim();
  const candidatePath = resolveSemanticPathCandidate(message, explicitCandidatePath);
  const hasLookVerb = includesAny(message, ZH_READ_KEYWORDS);
  const hasFileNoun = includesAny(message, ZH_FILE_NOUNS);

  const isReadIntent =
    (/(read|open|cat|show)/i.test(message) || hasLookVerb) && explicitCandidatePath.length > 0;
  if (isReadIntent) {
    return {
      title: 'semantic-fs-read',
      toolName: 'fs.read',
      input: {
        path: explicitCandidatePath,
        maxBytes: 200_000,
      },
    };
  }

  const isSearchIntent = /(search|find|grep)/i.test(message) || includesAny(message, ZH_SEARCH_KEYWORDS);
  if (isSearchIntent) {
    const quotedPattern = message.match(/"(.*?)"|'(.*?)'|`(.*?)`/);
    const pattern =
      quotedPattern?.[1] ??
      quotedPattern?.[2] ??
      quotedPattern?.[3] ??
      extractSearchPattern(lowered);
    if (pattern) {
      return {
        title: 'semantic-fs-search',
        toolName: 'fs.search',
        input: {
          path: candidatePath || '.',
          pattern,
          recursive: /(recursive)/i.test(message) || includesAny(message, ZH_RECURSIVE_KEYWORDS),
          maxMatches: 80,
        },
      };
    }
  }

  const isListIntent =
    /(list|ls|dir|tree)/i.test(message) ||
    includesAny(message, ZH_LIST_KEYWORDS) ||
    (hasLookVerb && hasFileNoun);
  if (isListIntent) {
    return {
      title: 'semantic-fs-list',
      toolName: 'fs.list',
      input: {
        path: candidatePath || '.',
        recursive: /(recursive|tree)/i.test(message) || includesAny(message, ZH_RECURSIVE_KEYWORDS),
        maxEntries: 200,
      },
    };
  }

  return undefined;
}

function deriveSemanticToolStep(request: AgentRunRequest): SemanticToolStep | undefined {
  const rawMessage = typeof request.metadata?.userMessage === 'string' ? request.metadata.userMessage : request.goal;
  return detectSemanticToolStep(rawMessage);
}

function extractSearchPattern(loweredMessage: string): string | undefined {
  const normalized = loweredMessage.replace(/\s+/g, ' ');
  const markers = ['search ', 'find ', 'grep ', '\u641c\u7d22', '\u67e5\u627e'];
  for (const marker of markers) {
    const idx = normalized.indexOf(marker);
    if (idx < 0) {
      continue;
    }
    const tail = normalized.slice(idx + marker.length).trim();
    if (tail.length === 0) {
      continue;
    }
    return tail.split(' ')[0];
  }
  return undefined;
}

export class StaticPlanner implements Planner {
  async plan(request: AgentRunRequest, _context: ContextEnvelope): Promise<AgentPlan> {
    if (request.plan) {
      return {
        ...request.plan,
        id: request.plan.id || nextPlanId(),
        strategy: request.plan.strategy || request.strategy || 'plan',
        steps: request.plan.steps.map((step) => normalizeStep(step))
      };
    }

    if (request.runnerCommand) {
      return {
        id: nextPlanId(),
        strategy: request.strategy ?? 'plan',
        steps: [
          {
            id: nextStepId(),
            title: 'runner-execution',
            kind: 'runner',
            dependsOn: [],
            runner: {
              command: request.runnerCommand,
              args: request.runnerArgs ?? [],
              stream: true
            },
            input: {
              goal: request.goal
            }
          }
        ]
      };
    }

    const semanticToolStep = deriveSemanticToolStep(request);
    if (semanticToolStep) {
      return {
        id: nextPlanId(),
        strategy: request.strategy ?? 'plan',
        steps: [
          {
            id: nextStepId(),
            title: semanticToolStep.title,
            kind: 'tool',
            dependsOn: [],
            toolName: semanticToolStep.toolName,
            input: semanticToolStep.input,
          },
        ],
      };
    }

    return {
      id: nextPlanId(),
      strategy: request.strategy ?? 'plan',
      steps: [
        {
          id: nextStepId(),
          title: 'llm-reasoning',
          kind: 'llm',
          dependsOn: [],
          input: {
            goal: request.goal
          }
        }
      ]
    };
  }
}
