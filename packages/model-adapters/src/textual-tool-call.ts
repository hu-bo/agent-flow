import { randomUUID } from 'node:crypto';

export interface NormalizedToolCall {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
}

export interface TextualToolCallNormalizationResult {
  text: string;
  toolCalls: NormalizedToolCall[];
  format?: 'dsml';
}

const DSML_BLOCK_PATTERN = /<｜｜DSML｜｜tool_calls>([\s\S]*?)<\/｜｜DSML｜｜tool_calls>/g;
const DSML_INVOKE_PATTERN = /<｜｜DSML｜｜invoke\b([^>]*)>([\s\S]*?)<\/｜｜DSML｜｜invoke>/g;
const DSML_PARAMETER_PATTERN = /<｜｜DSML｜｜parameter\b([^>]*)>([\s\S]*?)<\/｜｜DSML｜｜parameter>/g;
const ATTRIBUTE_PATTERN = /([A-Za-z0-9_-]+)="([^"]*)"/g;

export function normalizeTextualToolCalls(text: string): TextualToolCallNormalizationResult {
  if (!text.includes('<｜｜DSML｜｜tool_calls>')) {
    return { text, toolCalls: [] };
  }

  const extractedCalls: NormalizedToolCall[] = [];
  const cleaned = text.replace(DSML_BLOCK_PATTERN, (_full, blockBody: string) => {
    extractedCalls.push(...parseDsmlToolCalls(blockBody));
    return ' ';
  });

  return {
    text: collapseWhitespace(cleaned),
    toolCalls: extractedCalls,
    format: extractedCalls.length > 0 ? 'dsml' : undefined,
  };
}

function parseDsmlToolCalls(blockBody: string): NormalizedToolCall[] {
  const calls: NormalizedToolCall[] = [];

  for (const match of blockBody.matchAll(DSML_INVOKE_PATTERN)) {
    const attrs = parseAttributes(match[1] ?? '');
    const toolName = attrs.name?.trim();
    if (!toolName) {
      continue;
    }

    const args: Record<string, unknown> = {};
    for (const parameterMatch of (match[2] ?? '').matchAll(DSML_PARAMETER_PATTERN)) {
      const parameterAttrs = parseAttributes(parameterMatch[1] ?? '');
      const parameterName = parameterAttrs.name?.trim();
      if (!parameterName) {
        continue;
      }
      args[parameterName] = coerceParameterValue(parameterAttrs, decodeEntities(parameterMatch[2] ?? ''));
    }

    calls.push({
      toolCallId: randomUUID(),
      toolName,
      args,
    });
  }

  return calls;
}

function parseAttributes(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const match of raw.matchAll(ATTRIBUTE_PATTERN)) {
    const key = match[1]?.trim();
    if (!key) {
      continue;
    }
    attrs[key] = decodeEntities(match[2] ?? '');
  }
  return attrs;
}

function coerceParameterValue(attrs: Record<string, string>, rawValue: string): unknown {
  const value = rawValue.trim();
  if (attrs.string === 'true') {
    return value;
  }
  if (attrs.boolean === 'true') {
    return value.toLowerCase() === 'true';
  }
  if (attrs.number === 'true' || attrs.integer === 'true' || attrs.float === 'true') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }
  if (attrs.json === 'true') {
    return parseJsonLike(value);
  }
  return parseJsonLike(value);
}

function parseJsonLike(value: string): unknown {
  if (!value) {
    return '';
  }

  const first = value[0];
  if (!['{', '[', '"'].includes(first) && !/^[-\d.tfn]/i.test(first)) {
    return value;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

function decodeEntities(value: string): string {
  return value
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');
}

function collapseWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
