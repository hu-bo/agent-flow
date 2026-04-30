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

interface SemanticToolStep {
  title: string;
  toolName: 'fs.read' | 'fs.list' | 'fs.search';
  input: Record<string, unknown>;
}

function deriveSemanticToolStep(request: AgentRunRequest): SemanticToolStep | undefined {
  const rawMessage = typeof request.metadata?.userMessage === 'string' ? request.metadata.userMessage : request.goal;
  const message = rawMessage.trim();
  if (!message) {
    return undefined;
  }

  const lowered = message.toLowerCase();
  const quotedPath = message.match(/`([^`]+)`/)?.[1];
  const genericPath = message.match(/[A-Za-z]:\\[^\s"'`]+|\.{0,2}[\\/][^\s"'`]+|[A-Za-z0-9._-]+[\\/][^\s"'`]+/)?.[0];
  const candidatePath = (quotedPath ?? genericPath ?? '').trim();

  const isReadIntent =
    /(read|open|cat|show|查看|读取|打开|读一下|看一下)/i.test(message) &&
    candidatePath.length > 0;
  if (isReadIntent) {
    return {
      title: 'semantic-fs-read',
      toolName: 'fs.read',
      input: {
        path: candidatePath,
        maxBytes: 200_000,
      },
    };
  }

  const isSearchIntent = /(search|find|grep|查找|搜索)/i.test(message);
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
          recursive: /(recursive|递归|全局)/i.test(message),
          maxMatches: 80,
        },
      };
    }
  }

  const isListIntent = /(list|ls|dir|tree|目录|列出|文件列表)/i.test(message);
  if (isListIntent) {
    return {
      title: 'semantic-fs-list',
      toolName: 'fs.list',
      input: {
        path: candidatePath || '.',
        recursive: /(recursive|递归|tree|全量)/i.test(message),
        maxEntries: 200,
      },
    };
  }

  return undefined;
}

function extractSearchPattern(loweredMessage: string): string | undefined {
  const normalized = loweredMessage.replace(/\s+/g, ' ');
  const markers = ['search ', 'find ', 'grep ', '搜索', '查找'];
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
