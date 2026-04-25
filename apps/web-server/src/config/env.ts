import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().min(0).default(9200),
  HOST: z.string().min(1).default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  AGENT_FLOW_MODEL: z.string().min(1).default('gpt-4o'),
  AGENT_FLOW_CORS_ORIGIN: z.string().optional(),
});

export interface AppEnv {
  port: number;
  host: string;
  nodeEnv: 'development' | 'test' | 'production';
  defaultModel: string;
  corsOrigin: true | string | RegExp | Array<string | RegExp>;
}

export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  const parsed = envSchema.parse(source);

  return {
    port: parsed.PORT,
    host: parsed.HOST,
    nodeEnv: parsed.NODE_ENV,
    defaultModel: parsed.AGENT_FLOW_MODEL,
    corsOrigin: parseCorsOrigin(parsed.AGENT_FLOW_CORS_ORIGIN),
  };
}

function parseCorsOrigin(
  rawOrigin: string | undefined,
): true | string | RegExp | Array<string | RegExp> {
  if (!rawOrigin || rawOrigin === '*') {
    return true;
  }

  const parts = rawOrigin
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return parts.length <= 1 ? parts[0] ?? true : parts;
}
