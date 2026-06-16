import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
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
  templateBaseUrl?: string;
  templateDir?: string;
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

interface RunnerPackagePlatformProfile {
  os: NormalizedPlatform['os'];
  arch: NormalizedPlatform['arch'];
  defaultShell: string;
  pathSeparator: string;
  lineEnding: 'CRLF' | 'LF';
  workspaceRoots: string[];
  availableCommands: string[];
}

export class RunnerPackageService {
  constructor(
    private readonly registrationService: RunnerRegistrationService,
    private readonly options: RunnerPackageServiceOptions,
  ) {}

  async buildDownload(platformKey: string, ownerUserId: string): Promise<RunnerPackageResult> {
    const platform = normalizePlatform(platformKey);
    const issued = await this.registrationService.issueToken(ownerUserId);
    const tempDir = await mkdtemp(join(tmpdir(), 'aflow-runner-package-'));

    try {
      const template = await this.resolveTemplate(platform, tempDir);
      const extractDir = join(tempDir, 'extract');
      await materializeTemplate(template, extractDir);

      await writeFile(
        join(extractDir, 'config.json'),
        `${JSON.stringify({
          runnerId: '',
          runnerToken: issued.runnerToken,
          serverAddr: issued.grpcServerAddr,
          grpcServerAddr: issued.grpcServerAddr,
          httpServerAddr: issued.serverAddr,
          platform: buildPlatformProfile(platform),
        }, null, 2)}\n`,
        'utf8',
      );

      const zip = new AdmZip();
      const files = await collectFiles(extractDir, extractDir);
      for (const file of files) {
        zip.addFile(file.relativePath, file.content);
      }

      return {
        fileName: `agent-flow-runner-${platform.os}-${platform.arch}.zip`,
        buffer: zip.toBuffer(),
      };
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }

  private async resolveTemplate(platform: NormalizedPlatform, tempDir: string): Promise<string> {
    if (this.options.templateDir) {
      const root = resolve(this.options.templateDir);
      const candidates = [
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

    if (!this.options.templateBaseUrl) {
      throw new AppError(500, 'RUNNER_TEMPLATE_UNCONFIGURED', 'Runner package template source is not configured');
    }

    const fileName = `agent-flow-runner-${platform.os}-${platform.arch}.zip`;
    const url = `${this.options.templateBaseUrl.replace(/\/+$/, '')}/${fileName}`;
    const response = await axios.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
      timeout: 60_000,
    });
    const templatePath = join(tempDir, fileName);
    await writeFile(templatePath, Buffer.from(response.data));
    return templatePath;
  }
}

async function materializeTemplate(templatePath: string, extractDir: string): Promise<void> {
  const templateStat = await stat(templatePath);
  if (templateStat.isDirectory()) {
    await cp(templatePath, extractDir, { recursive: true, force: true });
    return;
  }

  const zip = new AdmZip(templatePath);
  for (const entry of zip.getEntries()) {
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

async function collectFiles(root: string, dir: string): Promise<Array<{ relativePath: string; content: Buffer }>> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: Array<{ relativePath: string; content: Buffer }> = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(root, fullPath));
      continue;
    }
    const relativePath = relative(root, fullPath);
    if (!relativePath || relativePath.startsWith('..')) {
      continue;
    }
    files.push({
      relativePath: relativePath.split(sep).join('/'),
      content: await readFile(fullPath),
    });
  }
  return files;
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

function buildPlatformProfile(platform: NormalizedPlatform): RunnerPackagePlatformProfile {
  return {
    os: platform.os,
    arch: platform.arch,
    defaultShell: defaultShellFor(platform.os),
    pathSeparator: platform.os === 'windows' ? '\\' : '/',
    lineEnding: platform.os === 'windows' ? 'CRLF' : 'LF',
    workspaceRoots: [],
    availableCommands: availableCommandsFor(platform.os),
  };
}

function defaultShellFor(os: NormalizedPlatform['os']): string {
  if (os === 'windows') {
    return 'powershell.exe';
  }
  if (os === 'darwin') {
    return 'zsh';
  }
  return 'sh';
}

function availableCommandsFor(os: NormalizedPlatform['os']): string[] {
  if (os === 'windows') {
    return ['cmd.exe', 'powershell.exe', 'pwsh.exe', 'where.exe', 'git', 'pnpm', 'npm', 'node'];
  }
  return ['sh', 'bash', 'zsh', 'git', 'pnpm', 'npm', 'node', 'grep', 'find', 'rg', 'which'];
}

function isSupportedOs(value: string | undefined): value is NormalizedPlatform['os'] {
  return value === 'windows' || value === 'darwin' || value === 'linux';
}

function isSupportedArch(value: string | undefined): value is NormalizedPlatform['arch'] {
  return value === 'amd64' || value === 'arm64';
}
