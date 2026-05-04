import type { ToolDefinition, ToolSchema } from '@agent-flow/core';
import { z } from 'zod';

export interface HttpToolInput {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
}

export interface HttpToolOutput {
  status: number;
  statusText: string;
  ok: boolean;
  headers: Record<string, string>;
  body: unknown;
}

const httpToolInputSchema = z.object({
  url: z.string().url(),
  method: z.string().trim().min(1).optional(),
  headers: z.record(z.string()).optional(),
  body: z.unknown().optional(),
  timeoutMs: z.number().int().positive().max(120_000).optional()
});

type ParsedHttpToolInput = z.infer<typeof httpToolInputSchema>;

export class HttpTool implements ToolDefinition<HttpToolInput, HttpToolOutput> {
  readonly schema: ToolSchema = {
    name: 'http.request',
    description: 'Execute an HTTP request and return structured response payload.',
    input: {
      type: 'object',
      required: ['url'],
      properties: {
        url: { type: 'string', description: 'Request URL.' },
        method: { type: 'string', description: 'HTTP method. Defaults to GET.' },
        headers: { type: 'object', description: 'Additional request headers.' },
        body: { description: 'Optional request body.' },
        timeoutMs: { type: 'number', description: 'Request timeout in milliseconds.' }
      }
    },
    output: {
      type: 'object',
      required: ['status', 'statusText', 'ok', 'headers', 'body'],
      properties: {
        status: { type: 'number' },
        statusText: { type: 'string' },
        ok: { type: 'boolean' },
        headers: { type: 'object' },
        body: {}
      }
    }
  };

  async execute(input: HttpToolInput): Promise<HttpToolOutput> {
    const parsed = parseHttpToolInput(input);
    const timeoutMs = parsed.timeoutMs ?? 20_000;
    const timeoutController = new AbortController();
    const timeout = setTimeout(() => timeoutController.abort('Request timeout'), timeoutMs);

    try {
      const response = await fetch(parsed.url, {
        method: parsed.method ?? 'GET',
        headers: buildHeaders(parsed.headers, parsed.body),
        body: buildBody(parsed.body),
        signal: timeoutController.signal
      });

      const responseBody = await parseResponseBody(response);
      return {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseBody
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

function parseHttpToolInput(input: unknown): ParsedHttpToolInput {
  const result = httpToolInputSchema.safeParse(input);
  if (!result.success) {
    throw new Error(`Invalid http.request input: ${result.error.message}`);
  }
  return result.data;
}

function buildHeaders(
  inputHeaders: Record<string, string> | undefined,
  body: unknown
): Record<string, string> | undefined {
  if (!inputHeaders && body === undefined) {
    return undefined;
  }

  const headers: Record<string, string> = { ...(inputHeaders ?? {}) };
  if (body !== undefined && typeof body !== 'string' && headers['content-type'] === undefined) {
    headers['content-type'] = 'application/json';
  }
  return headers;
}

function buildBody(body: unknown): string | undefined {
  if (body === undefined) {
    return undefined;
  }
  if (typeof body === 'string') {
    return body;
  }
  return JSON.stringify(body);
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.length === 0) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}
