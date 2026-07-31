import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import AdmZipType from 'adm-zip';
import axios from 'axios';
import { AppError } from '../lib/errors.js';
import type { RunnerRegistrationService } from './runner-registration-service.js';

const require = createRequire(import.meta.url);
const AdmZip = require('adm-zip') as typeof AdmZipType;

export type RunnerPackagePlatformKey =
  | 'windows-amd64'
  | 'windows-arm64'
  | 'darwin-arm64'
  | 'darwin-amd64'
  | 'macos-arm64'
  | 'macos-amd64'
  | 'linux-amd64';

export interface RunnerPackageServiceOptions {
  templateDir?: string;
  tempDir: string;
}

export interface RunnerPackageResult {
  fileName: string;
  buffer: Buffer;
}

interface NormalizedPlatform {
  key: string;
  os: 'windows' | 'darwin' | 'linux';
  arch: 'amd64' | 'arm64';
}

interface RunnerPackageTemplate {
  fileName: string;
  url: string;
}

const RUNNER_GRPC_SERVER_ADDR = 'aflow-grpc.8and1.cn';
const RUNNER_PACKAGE_TEMPLATES = {
  windows: {
    fileName: 'agent-flow-runner-windows-amd64.zip',
    url: 'http://minio.8and1.cn/static/aflow/agent-flow-runner-windows-amd64.zip',
  },
  darwin: {
    fileName: 'agent-flow-runner-darwin-amd64.zip',
    url: 'http://minio.8and1.cn/static/aflow/agent-flow-runner-darwin-amd64.zip',
  },
  linux: {
    fileName: 'agent-flow-runner-linux-amd64.zip',
    url: 'http://minio.8and1.cn/static/aflow/agent-flow-runner-linux-amd64.zip',
  },
} as const satisfies Record<'windows' | 'darwin' | 'linux', RunnerPackageTemplate>;


export class RunnerPackageService {
  constructor(
    private readonly registrationService: RunnerRegistrationService,
    private readonly options: RunnerPackageServiceOptions,
  ) {}

  async buildDownload(platformKey: string, ownerUserId: string): Promise<RunnerPackageResult> {
    const platform = normalizePlatform(platformKey);
    const packageTemplate = resolvePackageTemplate(platform);
    const tempRoot = resolve(this.options.tempDir);
    await mkdir(tempRoot, { recursive: true });
    const tempDir = await mkdtemp(join(tempRoot, 'request-'));

    try {
      const template = await this.resolveTemplate(platform, packageTemplate, tempDir);
      const extractDir = join(tempDir, 'extract');
      await materializeTemplate(template, extractDir);
      const issued = await this.registrationService.issueToken(ownerUserId);
      await updateRunnerConfig(extractDir, issued.runnerToken);

      const zip = new AdmZip();
      zip.addLocalFolder(extractDir);
      const buffer = zip.toBuffer();
      if (zip.getEntries().length === 0 || buffer.byteLength === 0) {
        throw new AppError(500, 'RUNNER_PACKAGE_BUILD_FAILED', 'Generated runner package is empty');
      }
      validateGeneratedPackage(buffer);

      return {
        fileName: packageTemplate.fileName,
        buffer,
      };
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }

  private async resolveTemplate(
    platform: NormalizedPlatform,
    packageTemplate: RunnerPackageTemplate,
    tempDir: string,
  ): Promise<string> {
    if (this.options.templateDir) {
      const root = resolve(this.options.templateDir);
      const candidates = [
        join(root, packageTemplate.fileName),
        join(root, packageTemplate.fileName.replace(/\.zip$/i, '')),
        join(root, platform.key),
        join(root, `agent-flow-runner-${platform.os}-${platform.arch}`),
      ];

      for (const candidate of candidates) {
        const found = await resolveLocalTemplate(candidate);
        if (found) {
          return found;
        }
      }
      throw new AppError(404, 'RUNNER_TEMPLATE_NOT_FOUND', `Runner template not found for ${platform.key}`);
    }

    const response = await axios.get<ArrayBuffer>(packageTemplate.url, {
      responseType: 'arraybuffer',
      timeout: 60_000,
    });
    const templateBuffer = Buffer.from(response.data);
    if (templateBuffer.byteLength === 0) {
      throw new AppError(502, 'RUNNER_TEMPLATE_DOWNLOAD_FAILED', `Downloaded runner template is empty: ${packageTemplate.url}`);
    }
    const templatePath = join(tempDir, packageTemplate.fileName);
    await writeFile(templatePath, templateBuffer);
    return templatePath;
  }
}

async function updateRunnerConfig(extractDir: string, runnerToken: string): Promise<void> {
  const configPath = await findConfigFile(extractDir);
  if (!configPath) {
    throw new AppError(400, 'RUNNER_TEMPLATE_INVALID', 'Runner template does not contain config.json');
  }

  let config: unknown;
  try {
    const configText = await readFile(configPath, 'utf8');
    config = JSON.parse(configText.replace(/^\uFEFF/, ''));
  } catch {
    throw new AppError(400, 'RUNNER_TEMPLATE_INVALID', 'Runner template config.json is not valid JSON');
  }
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new AppError(400, 'RUNNER_TEMPLATE_INVALID', 'Runner template config.json must contain an object');
  }

  await writeFile(
    configPath,
    `${JSON.stringify({
      ...config,
      runnerToken,
      serverAddr: RUNNER_GRPC_SERVER_ADDR,
    }, null, 2)}\n`,
    'utf8',
  );
}

function validateGeneratedPackage(buffer: Buffer): void {
  try {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();
    if (entries.length === 0 || !entries.some((entry) => !entry.isDirectory && entry.entryName.endsWith('config.json'))) {
      throw new Error('Required files are missing');
    }
  } catch {
    throw new AppError(500, 'RUNNER_PACKAGE_BUILD_FAILED', 'Generated runner package is not a valid zip');
  }
}

async function findConfigFile(dir: string): Promise<string | undefined> {
  const entries = await readdir(dir, { withFileTypes: true });
  const directConfig = entries.find((entry) => entry.isFile() && entry.name === 'config.json');
  if (directConfig) {
    return join(dir, directConfig.name);
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const nestedConfig = await findConfigFile(join(dir, entry.name));
    if (nestedConfig) {
      return nestedConfig;
    }
  }
  return undefined;
}

async function materializeTemplate(templatePath: string, extractDir: string): Promise<void> {
  const templateStat = await stat(templatePath);
  if (templateStat.isDirectory()) {
    await cp(templatePath, extractDir, { recursive: true, force: true });
    return;
  }

  const zip = new AdmZip(templatePath);
  const entries = zip.getEntries();
  if (entries.length === 0) {
    throw new AppError(400, 'RUNNER_TEMPLATE_INVALID', 'Runner template zip is empty');
  }
  for (const entry of entries) {
    const target = resolve(extractDir, entry.entryName);
    const rel = relative(extractDir, target);
    if (!rel || rel.startsWith('..') || resolve(extractDir, rel) === extractDir) {
      throw new AppError(400, 'RUNNER_TEMPLATE_INVALID', `Unsafe zip entry: ${entry.entryName}`);
    }
    if (entry.isDirectory) {
      continue;
    }
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, entry.getData());
  }
}

async function resolveLocalTemplate(candidate: string): Promise<string | undefined> {
  const candidateStat = await stat(candidate).catch(() => undefined);
  if (candidateStat?.isDirectory()) {
    const zip = await findZip(candidate);
    return zip ?? candidate;
  }
  if (candidateStat?.isFile() && candidate.toLowerCase().endsWith('.zip')) {
    return candidate;
  }
  const zipCandidate = `${candidate}.zip`;
  const zipStat = await stat(zipCandidate).catch(() => undefined);
  return zipStat?.isFile() ? zipCandidate : undefined;
}

async function findZip(dir: string): Promise<string | undefined> {
  const entries = await readdir(dir).catch(() => []);
  const zip = entries.find((name) => name.toLowerCase().endsWith('.zip'));
  return zip ? join(dir, zip) : undefined;
}

function normalizePlatform(raw: string): NormalizedPlatform {
  const key = raw.trim().toLowerCase();
  const normalized = key.startsWith('macos-') ? key.replace(/^macos-/, 'darwin-') : key;
  const [os, arch] = normalized.split('-');
  if (!isSupportedOs(os) || !isSupportedArch(arch)) {
    throw new AppError(400, 'RUNNER_PLATFORM_UNSUPPORTED', `Unsupported runner platform: ${raw}`);
  }
  return {
    key: normalized,
    os,
    arch,
  };
}

function resolvePackageTemplate(platform: NormalizedPlatform): RunnerPackageTemplate {
  if (platform.arch !== 'amd64') {
    throw new AppError(400, 'RUNNER_PLATFORM_UNSUPPORTED', `Unsupported runner platform: ${platform.key}`);
  }
  return RUNNER_PACKAGE_TEMPLATES[platform.os];
}

function isSupportedOs(value: string | undefined): value is NormalizedPlatform['os'] {
  return value === 'windows' || value === 'darwin' || value === 'linux';
}

function isSupportedArch(value: string | undefined): value is NormalizedPlatform['arch'] {
  return value === 'amd64' || value === 'arm64';
}
