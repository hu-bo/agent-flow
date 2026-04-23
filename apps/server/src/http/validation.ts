import type { Context } from 'hono';
import { HttpError } from '../errors.js';

export type JsonObject = Record<string, unknown>;

function ensureObject(value: unknown): JsonObject {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as JsonObject;
  }
  throw new HttpError(400, 'Request body must be a JSON object', 'INVALID_JSON_BODY');
}

export async function parseJsonBody(c: Context): Promise<JsonObject> {
  const contentType = c.req.header('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new HttpError(415, 'Content-Type must be application/json', 'UNSUPPORTED_MEDIA_TYPE');
  }

  try {
    const payload = await c.req.json<unknown>();
    return ensureObject(payload);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, 'Invalid JSON payload', 'INVALID_JSON_BODY');
  }
}

export function optionalString(
  body: JsonObject,
  key: string,
  opts: { trim?: boolean } = {},
): string | undefined {
  const value = body[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') {
    throw new HttpError(400, `${key} must be a string`, 'VALIDATION_ERROR');
  }
  return opts.trim === false ? value : value.trim();
}

export function requiredString(
  body: JsonObject,
  key: string,
  opts: { trim?: boolean } = {},
): string {
  const value = optionalString(body, key, opts);
  if (!value) {
    throw new HttpError(400, `${key} is required`, 'VALIDATION_ERROR');
  }
  return value;
}

export function optionalBoolean(body: JsonObject, key: string): boolean | undefined {
  const value = body[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'boolean') {
    throw new HttpError(400, `${key} must be a boolean`, 'VALIDATION_ERROR');
  }
  return value;
}

