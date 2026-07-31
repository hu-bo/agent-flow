import type { UnifiedMessage } from '@agent-flow/core/messages';
import type { SessionRecord, SpecDocType, SpecWorkflowPhase, SpecWorkflowState } from '../contracts/api.js';
import { ConflictError, ValidationError } from '../lib/errors.js';
import { SessionService } from './session-service.js';

interface SpecStateResult {
  session: SessionRecord;
  workflow: SpecWorkflowState;
}

interface BuildSpecPromptInput {
  session: SessionRecord;
  phase: SpecWorkflowPhase;
}

interface ConfirmSpecResult {
  session: SessionRecord;
  workflow: SpecWorkflowState;
  autoPrompt?: string;
}

interface ConfirmSpecOptions {
  selectedArtifacts?: string[];
}

interface CapturedSpecDocument {
  docType: SpecDocType;
  content: string;
  summary: UnifiedMessage;
}

const MAX_AUTO_REGENERATE_ATTEMPTS = 2;
const FORBIDDEN_TASK_PHRASES = [
  '\u518d\u8ba8\u8bba',
  '\u518d\u8bbe\u8ba1',
  '\u540e\u7eed\u518d\u8bbe\u8ba1',
  '\u540e\u7eed\u518d\u8ba8\u8bba',
  're-discuss',
  'rediscuss',
  're-design',
  'redesign',
];

const TASK_LINE_PATTERN = /^[-*]\s+\[[^\]]+\]\s+\[[^\]]+\]\s+\[[^\]]+\]/;

const HEADING_BACKGROUND = '## \u80cc\u666f';
const HEADING_GOAL = '## \u76ee\u6807';
const HEADING_REQUIREMENTS = '## \u9700\u6c42';
const REQUIRED_HEADING = '## \u5fc5\u9009\u4efb\u52a1 (Required Tasks)';
const OPTIONAL_HEADING = '## \u53ef\u9009\u4efb\u52a1 (Optional Tasks)';
const TASK_LINE_TEMPLATE = '- [\u6a21\u5757] [\u8d1f\u8d23\u4eba] [\u9884\u8ba1\u65f6\u957f] \u4efb\u52a1\u8bf4\u660e';

export class SpecWorkflowService {
  constructor(private readonly sessionService: SessionService) {}

  async ensureSpecState(sessionId: string): Promise<SpecStateResult> {
    const state = await this.sessionService.getSessionState(sessionId);
    const session = state.session;
    if (session.mode !== 'spec') {
      throw new ConflictError(`Session "${sessionId}" is not in spec mode`);
    }
    const workflow = this.ensureWorkflow(session);
    return {
      session,
      workflow,
    };
  }

  buildSpecPrompt(input: BuildSpecPromptInput): string {
    const workflow = input.session.specWorkflow;
    const phase = workflow?.phase ?? input.phase;

    if (phase === 'requirements') {
      return [
        'You are now in phase 1 (requirements) of a strict spec workflow.',
        'Output Markdown only and follow the exact structure below:',
        '',
        '# Requirements',
        HEADING_BACKGROUND,
        HEADING_GOAL,
        HEADING_REQUIREMENTS,
        '### \u9700\u6c421',
        '### \u9700\u6c422',
        '',
        'Rules:',
        '1. Make each requirement concrete and verifiable.',
        '2. Do not include implementation design details.',
        '3. Do not add extra top-level sections.',
      ].join('\n');
    }

    if (phase === 'design') {
      const requirements = workflow?.documents?.requirements?.trim();
      return [
        'You are now in phase 2 (design) of a strict spec workflow.',
        'Use the existing requirements and output Markdown only with this exact structure:',
        requirements ? ['', 'Existing requirements.md:', requirements] : '',
        '',
        '# Design',
        '## Solution 1',
        '## Solution 2',
        '',
        'Rules:',
        '1. Focus on architecture, boundaries, data flow, and risks.',
        '2. Do not output task breakdown yet.',
        '3. Do not add extra top-level sections.',
      ].join('\n');
    }

    const requirements = workflow?.documents?.requirements?.trim();
    const design = workflow?.documents?.design?.trim();
    return [
      'You are now in phase 3 (tasks) of a strict spec workflow.',
      'Use the existing design and output Markdown only with this exact structure:',
      requirements ? ['', 'Existing requirements.md:', requirements] : '',
      design ? ['', 'Existing design.md:', design] : '',
      '',
      '# Task Breakdown',
      REQUIRED_HEADING,
      OPTIONAL_HEADING,
      '',
      'Each task must be a single line in this format:',
      TASK_LINE_TEMPLATE,
      '',
      'Rules:',
      '1. Every task must be completable in one work session.',
      '2. Never include deferred wording such as "later redesign/discuss".',
      '3. Split work across modules/responsibility boundaries into separate tasks.',
      '4. Do not add extra top-level sections.',
    ].join('\n');
  }

  async onAssistantMessageCreated(sessionId: string, message: UnifiedMessage): Promise<void> {
    if (message.role !== 'assistant') {
      return;
    }
    const state = await this.sessionService.getSessionState(sessionId);
    const session = state.session;
    if (session.mode !== 'spec') {
      return;
    }
    const workflow = this.ensureWorkflow(session);
    const text = extractMessageText(message);
    if (!text) {
      return;
    }

    if (workflow.phase === 'requirements' && isRequirementsDoc(text)) {
      workflow.requirementsMsgId = message.uuid;
      workflow.awaitingConfirm = true;
      await this.sessionService.saveSession(session);
      return;
    }

    if (workflow.phase === 'design' && isDesignDoc(text)) {
      workflow.designMsgId = message.uuid;
      workflow.awaitingConfirm = true;
      await this.sessionService.saveSession(session);
      return;
    }

    if (workflow.phase === 'tasks' && isTaskDoc(text)) {
      workflow.taskListMsgId = message.uuid;
      workflow.awaitingConfirm = true;
      await this.sessionService.saveSession(session);
    }
  }

  async captureAssistantDocument(sessionId: string, message: UnifiedMessage): Promise<CapturedSpecDocument | null> {
    if (message.role !== 'assistant') {
      return null;
    }
    const state = await this.sessionService.getSessionState(sessionId);
    const session = state.session;
    if (session.mode !== 'spec') {
      return null;
    }
    const workflow = this.ensureWorkflow(session);
    const content = extractMessageText(message);
    if (!content) {
      return null;
    }

    const docType = workflow.phase;
    workflow.documents = {
      ...(workflow.documents ?? {}),
      [docType]: content,
    };
    this.markDocumentReady(workflow, docType, message.uuid, content);
    await this.sessionService.saveSession(session);

    return {
      docType,
      content,
      summary: createSpecSummaryMessage(message, docType, workflow.awaitingConfirm),
    };
  }

  async getDocument(sessionId: string, docType: SpecDocType): Promise<string> {
    const workflow = (await this.ensureSpecState(sessionId)).workflow;
    return workflow.documents?.[docType] ?? '';
  }

  ensureTaskContractOrThrow(message: UnifiedMessage): void {
    if (message.role !== 'assistant') {
      return;
    }
    const text = extractMessageText(message);
    if (!text || !isTaskDoc(text)) {
      return;
    }
    const issues = validateTaskBreakdown(text);
    if (issues.length > 0) {
      throw new ValidationError('Task breakdown does not satisfy spec contract', { issues });
    }
  }

  shouldAutoRegenerateForTaskValidationFailure(error: unknown, attempt: number): boolean {
    if (!(error instanceof ValidationError)) {
      return false;
    }
    if (attempt >= MAX_AUTO_REGENERATE_ATTEMPTS) {
      return false;
    }
    return error.message.includes('Task breakdown does not satisfy spec contract');
  }

  buildTaskRegeneratePromptFromValidation(error: ValidationError): string {
    const details = error.details as { issues?: string[] } | undefined;
    const issues = details?.issues ?? [];
    const renderedIssues = issues.length > 0 ? issues.map((issue) => `- ${issue}`).join('\n') : '- Unknown issue';
    return [
      'The previous task breakdown failed validation. Regenerate now and fix:',
      renderedIssues,
      '',
      'Output only this Markdown structure:',
      '# Task Breakdown',
      REQUIRED_HEADING,
      OPTIONAL_HEADING,
      '',
      'Each task line must be:',
      TASK_LINE_TEMPLATE,
      '',
      'Never include deferred wording like later redesign/discuss.',
    ].join('\n');
  }

  async confirm(sessionId: string, options: ConfirmSpecOptions = {}): Promise<ConfirmSpecResult> {
    const state = await this.sessionService.getSessionState(sessionId);
    const session = state.session;
    if (session.mode !== 'spec') {
      throw new ConflictError(`Session "${sessionId}" is not in spec mode`);
    }
    const workflow = this.ensureWorkflow(session);

    if (workflow.phase === 'tasks') {
      workflow.awaitingConfirm = true;
      await this.sessionService.saveSession(session);
      return {
        session,
        workflow,
      };
    }

    if (!workflow.awaitingConfirm) {
      throw new ConflictError(
        `Spec phase "${workflow.phase}" is not ready for confirmation in session "${sessionId}"`,
      );
    }

    if (workflow.phase === 'requirements') {
      workflow.phase = 'design';
      workflow.awaitingConfirm = false;
      await this.sessionService.saveSession(session);
      return {
        session,
        workflow,
        autoPrompt: appendSelectedArtifacts(
          this.buildSpecPrompt({ session, phase: 'design' }),
          options.selectedArtifacts,
        ),
      };
    }

    workflow.phase = 'tasks';
    workflow.awaitingConfirm = false;
    await this.sessionService.saveSession(session);
    return {
      session,
      workflow,
      autoPrompt: appendSelectedArtifacts(
        this.buildSpecPrompt({ session, phase: 'tasks' }),
        options.selectedArtifacts,
      ),
    };
  }

  private ensureWorkflow(session: SessionRecord): SpecWorkflowState {
    if (!session.specWorkflow) {
      session.specWorkflow = {
        phase: 'requirements',
        awaitingConfirm: false,
        documents: {},
      };
    }
    return session.specWorkflow;
  }

  private markDocumentReady(
    workflow: SpecWorkflowState,
    docType: SpecDocType,
    messageId: string,
    content: string,
  ): void {
    if (docType === 'requirements' && isRequirementsDoc(content)) {
      workflow.requirementsMsgId = messageId;
      workflow.awaitingConfirm = true;
      return;
    }

    if (docType === 'design' && isDesignDoc(content)) {
      workflow.designMsgId = messageId;
      workflow.awaitingConfirm = true;
      return;
    }

    if (docType === 'tasks' && isTaskDoc(content)) {
      workflow.taskListMsgId = messageId;
      workflow.awaitingConfirm = true;
    }
  }
}

function extractMessageText(message: UnifiedMessage): string {
  return message.type === 'text' ? message.text.trim() : '';
}

function hasAllSections(content: string, sections: string[]): boolean {
  return sections.every((section) => content.includes(section));
}

function isRequirementsDoc(content: string): boolean {
  return hasAllSections(content, ['# Requirements', HEADING_BACKGROUND, HEADING_GOAL, HEADING_REQUIREMENTS]);
}

function isDesignDoc(content: string): boolean {
  return hasAllSections(content, ['# Design', '## Solution 1', '## Solution 2']);
}

function isTaskDoc(content: string): boolean {
  return hasAllSections(content, ['# Task Breakdown', REQUIRED_HEADING, OPTIONAL_HEADING]);
}

function normalizeTaskText(content: string): string {
  return content
    .toLowerCase()
    .replace(/[，。！？、]/g, ' ');
}

function validateTaskBreakdown(content: string): string[] {
  const issues: string[] = [];
  if (!isTaskDoc(content)) {
    issues.push('Missing required task breakdown sections');
    return issues;
  }

  const normalized = normalizeTaskText(content);
  for (const phrase of FORBIDDEN_TASK_PHRASES) {
    if (normalized.includes(phrase.toLowerCase())) {
      issues.push(`Contains forbidden phrase: ${phrase}`);
    }
  }

  const requiredSection = extractSection(content, REQUIRED_HEADING, OPTIONAL_HEADING);
  if (!requiredSection) {
    issues.push('Required tasks section is empty');
  } else if (!containsValidTaskLine(requiredSection)) {
    issues.push('Required tasks must contain at least one task line with full fields');
  }

  const optionalSection = extractSection(content, OPTIONAL_HEADING);
  if (optionalSection && optionalSection.trim().length > 0 && !containsValidTaskLine(optionalSection)) {
    issues.push('Optional tasks lines must include module/owner/estimate/description fields');
  }

  return issues;
}

function containsValidTaskLine(section: string): boolean {
  const lines = section
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- ') || line.startsWith('* '));
  if (lines.length === 0) {
    return false;
  }
  return lines.every((line) => TASK_LINE_PATTERN.test(line));
}

function extractSection(content: string, startHeading: string, nextHeading?: string): string {
  const start = content.indexOf(startHeading);
  if (start < 0) {
    return '';
  }
  const startIndex = start + startHeading.length;
  const endIndex = nextHeading ? content.indexOf(nextHeading, startIndex) : -1;
  if (endIndex < 0) {
    return content.slice(startIndex);
  }
  return content.slice(startIndex, endIndex);
}

export function createSpecPromptMessage(prompt: string, parentUuid: string | null): UnifiedMessage {
  return {
    uuid: `spec_auto_${Date.now().toString(16)}_${Math.random().toString(16).slice(2, 10)}`,
    parentUuid,
    role: 'user',
    type: 'text',
    text: prompt,
    timestamp: new Date().toISOString(),
    metadata: {
      isMeta: true,
      extensions: {
        specAutoPrompt: true,
      },
    },
  };
}

function createSpecSummaryMessage(
  source: UnifiedMessage,
  docType: SpecDocType,
  readyForConfirm: boolean,
): UnifiedMessage {
  const label = phaseSummaryLabel(docType);
  const nextAction =
    docType === 'tasks'
      ? 'Task breakdown is ready in the Spec Markdown pane.'
      : readyForConfirm
        ? `Review the ${label.toLowerCase()} draft in the Spec Markdown pane, then confirm to continue.`
        : `${label} draft was updated in the Spec Markdown pane.`;

  return {
    ...source,
    type: 'text',
    text: nextAction,
    metadata: {
      ...source.metadata,
      extensions: {
        ...(source.metadata.extensions ?? {}),
        specDocSummary: true,
        specDocType: docType,
        sourceMsgId: source.uuid,
      },
    },
  };
}

function phaseSummaryLabel(docType: SpecDocType): string {
  if (docType === 'requirements') return 'Requirements';
  if (docType === 'design') return 'Design';
  return 'Tasks';
}

function appendSelectedArtifacts(prompt: string, selectedArtifacts?: string[]): string {
  const selected = (selectedArtifacts ?? []).map((artifact) => artifact.trim()).filter(Boolean);
  if (selected.length === 0) {
    return prompt;
  }

  return [
    prompt,
    '',
    'User selected these workflow artifacts/options for this phase:',
    ...selected.map((artifact) => `- ${artifact}`),
  ].join('\n');
}
