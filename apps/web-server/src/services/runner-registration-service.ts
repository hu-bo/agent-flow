import { createHash, randomBytes } from 'node:crypto';
import { Repository } from 'typeorm';
import type { AppDataSource } from '../db/data-source.js';
import { RunnerTokenEntity } from '../db/entities/runner-token.entity.js';
import { AppError } from '../lib/errors.js';

interface RunnerRegistrationServiceOptions {
  runnerServerAddr: string;
  runnerGrpcServerAddr?: string;
  runnerDownloadBaseUrl: string;
}

export interface RunnerDownloadUrls {
  windows: string;
  macos: string;
  linux: string;
}

export interface IssueRunnerTokenResult {
  runnerToken: string;
  tokenId: string;
  serverAddr: string;
  grpcServerAddr: string;
  downloadUrls: RunnerDownloadUrls;
}

export class RunnerRegistrationService {
  private readonly runnerTokenRepository: Repository<RunnerTokenEntity>;

  constructor(
    db: AppDataSource,
    private readonly options: RunnerRegistrationServiceOptions,
  ) {
    this.runnerTokenRepository = db.getRepository(RunnerTokenEntity);
  }

  async issueToken(ownerUserId: string): Promise<IssueRunnerTokenResult> {
    const runnerToken = generateRunnerToken();
    const tokenEntity = this.runnerTokenRepository.create({
      ownerUserId,
      tokenHash: hashRunnerToken(runnerToken),
      tokenPrefix: runnerToken.slice(0, 8),
      status: 'active',
      revokedAt: null,
    });
    const saved = await this.runnerTokenRepository.save(tokenEntity);

    return {
      runnerToken,
      tokenId: saved.tokenId,
      serverAddr: this.options.runnerServerAddr,
      grpcServerAddr: this.options.runnerGrpcServerAddr ?? this.options.runnerServerAddr,
      downloadUrls: this.getDownloadUrls(),
    };
  }

  async rotateToken(ownerUserId: string): Promise<IssueRunnerTokenResult> {
    await this.revokeAllActiveTokens(ownerUserId);
    return this.issueToken(ownerUserId);
  }

  async verifyToken(runnerToken: string): Promise<RunnerTokenEntity> {
    const tokenHash = hashRunnerToken(runnerToken);
    const token = await this.runnerTokenRepository.findOne({
      where: {
        tokenHash,
        status: 'active',
      },
    });
    if (!token) {
      throw new AppError(401, 'RUNNER_TOKEN_INVALID', 'Invalid or revoked runner token');
    }
    return token;
  }

  getDownloadUrls(): RunnerDownloadUrls {
    return buildDownloadUrls(this.options.runnerDownloadBaseUrl);
  }

  private async revokeAllActiveTokens(ownerUserId: string): Promise<void> {
    const now = new Date();
    await this.runnerTokenRepository.update(
      {
        ownerUserId,
        status: 'active',
      },
      {
        status: 'revoked',
        revokedAt: now,
      },
    );
  }
}

function generateRunnerToken(): string {
  return `afr_${randomBytes(32).toString('base64url')}`;
}

function hashRunnerToken(runnerToken: string): string {
  return createHash('sha256').update(runnerToken).digest('hex');
}

function buildDownloadUrls(baseUrl: string): RunnerDownloadUrls {
  const normalized = baseUrl.replace(/\/+$/, '');
  return {
    windows: `${normalized}/runner/windows/amd64`,
    macos: `${normalized}/runner/macos/arm64`,
    linux: `${normalized}/runner/linux/amd64`,
  };
}
