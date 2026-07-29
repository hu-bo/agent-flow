import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadDotEnvFile } from 'dotenv';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().min(0).default(9200),
  HOST: z.string().min(1).default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  AGENT_FLOW_MODEL: z.string().min(1).default('gpt5.4-Mini'),
  AGENT_FLOW_CORS_ORIGIN: z.string().optional(),
  DATABASE_URL: z
    .string()
    .min(1)
    .default('postgres://aflow_user:aflow_pass123@localhost:15000/aflow?sslmode=disable'),
  AUTH_API_BASE_URL: z.string().url().default('http://auth.8and1.cn'),
  AUTH_APP_NAME: z.string().trim().min(1).default('aflow'),
  RUNNER_SERVER_ADDR: z.string().min(1).default('127.0.0.1:9200'),
  RUNNER_GRPC_HOST: z.string().min(1).default('0.0.0.0'),
  RUNNER_GRPC_PORT: z.coerce.number().int().min(0).default(9201),
  RUNNER_GRPC_SERVER_ADDR: z.string().min(1).default('127.0.0.1:9201'),
  RUNNER_DOWNLOAD_BASE_URL: z.string().url().default('https://downloads.8and1.cn/agent-flow'),
  RUNNER_PACKAGE_TEMPLATE_DIR: z.string().trim().min(1).optional(),
});

export interface AppEnv {
  port: number;
  host: string;
  nodeEnv: 'development' | 'test' | 'production';
  defaultModel: string;
  corsOrigin: true | string | RegExp | Array<string | RegExp>;
  databaseUrl: string;
  authApiBaseUrl: string;
  authAppName: string;
  runnerServerAddr: string;
  runnerGrpcHost: string;
  runnerGrpcPort: number;
  runnerGrpcServerAddr: string;
  runnerDownloadBaseUrl: string;
  runnerPackageTemplateDir?: string;
}

export function loadEnv(source: NodeJS.ProcessEnv = loadProcessEnv()): AppEnv {
  const parsed = envSchema.parse(source);

  return {
    port: parsed.PORT,
    host: parsed.HOST,
    nodeEnv: parsed.NODE_ENV,
    defaultModel: parsed.AGENT_FLOW_MODEL,
    corsOrigin: parseCorsOrigin(parsed.AGENT_FLOW_CORS_ORIGIN),
    databaseUrl: parsed.DATABASE_URL,
    authApiBaseUrl: parsed.AUTH_API_BASE_URL,
    authAppName: parsed.AUTH_APP_NAME,
    runnerServerAddr: parsed.RUNNER_SERVER_ADDR,
    runnerGrpcHost: parsed.RUNNER_GRPC_HOST,
    runnerGrpcPort: parsed.RUNNER_GRPC_PORT,
    runnerGrpcServerAddr: parsed.RUNNER_GRPC_SERVER_ADDR,
    runnerDownloadBaseUrl: parsed.RUNNER_DOWNLOAD_BASE_URL,
    runnerPackageTemplateDir: parsed.RUNNER_PACKAGE_TEMPLATE_DIR,
  };
}

function loadProcessEnv(): NodeJS.ProcessEnv {
  const here = dirname(fileURLToPath(import.meta.url));
  const appRoot = resolve(here, '../..');
  const repoRoot = resolve(appRoot, '../..');
  const candidates = [resolve(process.cwd(), '.env'), resolve(appRoot, '.env'), resolve(repoRoot, '.env')];
  const seen = new Set<string>();

  for (const path of candidates) {
    if (seen.has(path)) {
      continue;
    }
    seen.add(path);

    if (existsSync(path)) {
      loadDotEnvFile({ path, override: false });
    }
  }

  return process.env;
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
