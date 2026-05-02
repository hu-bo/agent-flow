import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import type { RunnerTask } from '@agent-flow/core';
import type { AppDataSource } from '../db/data-source.js';
import { RunnerEntity } from '../db/entities/runner.entity.js';
import type { RunnerTokenEntity } from '../db/entities/runner-token.entity.js';
import { AppError, NotFoundError } from '../lib/errors.js';
import { RunnerRegistrationService } from './runner-registration-service.js';

interface RunnerRegistryServiceOptions {
  offlineTimeoutMs?: number;
}

export interface RunnerRegisterInput {
  runnerToken: string;
  runnerId?: string;
  kind?: 'local' | 'remote' | 'sandbox';
  host?: string;
  hostName?: string;
  hostIp?: string;
  version?: string;
  capabilities?: string[];
}

export interface RunnerHeartbeatInput {
  runnerId: string;
  runnerToken: string;
}

export class RunnerRegistryService {
  private readonly runnerRepository: Repository<RunnerEntity>;
  private readonly offlineTimeoutMs: number;

  constructor(
    db: AppDataSource,
    private readonly registrationService: RunnerRegistrationService,
    options: RunnerRegistryServiceOptions = {},
  ) {
    this.runnerRepository = db.getRepository(RunnerEntity);
    this.offlineTimeoutMs = options.offlineTimeoutMs ?? 30_000;
  }

  async listRunners(ownerUserId: string): Promise<RunnerEntity[]> {
    await this.markStaleRunnersOffline();
    return this.runnerRepository.find({
      where: { ownerUserId },
      order: { updatedAt: 'DESC' },
    });
  }

  async getRunnerForUser(ownerUserId: string, runnerId: string): Promise<RunnerEntity> {
    const runner = await this.runnerRepository.findOne({
      where: {
        ownerUserId,
        runnerId,
      },
    });
    if (!runner) {
      throw new NotFoundError(`Runner not found: ${runnerId}`);
    }
    return runner;
  }

  async removeRunnerForUser(ownerUserId: string, runnerId: string): Promise<void> {
    const result = await this.runnerRepository.delete({
      ownerUserId,
      runnerId,
    });
    if (!result.affected) {
      throw new NotFoundError(`Runner not found: ${runnerId}`);
    }
  }

  async register(input: RunnerRegisterInput): Promise<RunnerEntity> {
    const token = await this.registrationService.verifyToken(input.runnerToken);
    return this.upsertFromToken(token, input);
  }

  async heartbeat(input: RunnerHeartbeatInput): Promise<RunnerEntity> {
    const runner = await this.authorizeRunnerConnection(input.runnerId, input.runnerToken);
    runner.status = 'online';
    runner.lastSeenAt = new Date();
    return this.runnerRepository.save(runner);
  }

  async listRunnableRunners(
    ownerUserId: string,
    command: string,
    options: {
      preferredRunnerId?: string;
      preferredRunnerKind?: 'local' | 'remote' | 'sandbox';
    } = {},
  ): Promise<RunnerEntity[]> {
    await this.markStaleRunnersOffline();
    const all = await this.runnerRepository.find({
      where: {
        ownerUserId,
        status: 'online',
      },
      order: { updatedAt: 'DESC' },
    });

    return all.filter((runner) => {
      if (options.preferredRunnerId && runner.runnerId !== options.preferredRunnerId) {
        return false;
      }
      if (options.preferredRunnerKind && runner.kind !== options.preferredRunnerKind) {
        return false;
      }
      if (!Array.isArray(runner.capabilities) || runner.capabilities.length === 0) {
        return true;
      }
      return runner.capabilities.includes(command);
    });
  }

  async pickRunnableRunner(
    ownerUserId: string,
    command: string,
    options: {
      preferredRunnerId?: string;
      preferredRunnerKind?: 'local' | 'remote' | 'sandbox';
    } = {},
  ): Promise<RunnerEntity | undefined> {
    const runners = await this.listRunnableRunners(ownerUserId, command, options);
    return runners[0];
  }

  async canRun(task: RunnerTask): Promise<boolean> {
    const userId = task.metadata?.userId;
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      return false;
    }

    const preferredRunnerId =
      typeof task.metadata?.preferredRunnerId === 'string' ? task.metadata.preferredRunnerId : undefined;
    const preferredRunnerKind =
      task.metadata?.preferredRunnerKind === 'local' ||
      task.metadata?.preferredRunnerKind === 'remote' ||
      task.metadata?.preferredRunnerKind === 'sandbox'
        ? task.metadata.preferredRunnerKind
        : undefined;

    const runners = await this.listRunnableRunners(userId, task.command, {
      preferredRunnerId,
      preferredRunnerKind,
    });
    return runners.length > 0;
  }

  private async upsertFromToken(token: RunnerTokenEntity, input: RunnerRegisterInput): Promise<RunnerEntity> {
    const inputRunnerId = normalizeText(input.runnerId);
    const hostName = normalizeText(input.hostName) ?? normalizeText(input.host);
    const hostIp = normalizeText(input.hostIp);
    const host = normalizeText(input.host) ?? hostName;

    const existing = inputRunnerId ? await this.runnerRepository.findOne({ where: { runnerId: inputRunnerId } }) : null;
    if (existing && existing.ownerUserId !== token.ownerUserId) {
      throw new AppError(403, 'RUNNER_OWNER_MISMATCH', 'runner_id belongs to another user');
    }

    const runnerId = existing?.runnerId ?? inputRunnerId ?? createRunnerId();
    const runner = existing ?? this.runnerRepository.create({ runnerId });
    runner.ownerUserId = token.ownerUserId;
    runner.tokenId = token.tokenId;
    runner.kind = input.kind ?? runner.kind ?? 'local';
    runner.status = 'online';
    runner.host = host ?? runner.host ?? null;
    runner.hostName = hostName ?? runner.hostName ?? null;
    runner.hostIp = hostIp ?? runner.hostIp ?? null;
    runner.version = normalizeText(input.version) ?? runner.version ?? null;
    runner.capabilities = input.capabilities ?? runner.capabilities ?? [];
    runner.lastSeenAt = new Date();
    return this.runnerRepository.save(runner);
  }

  async authorizeRunnerConnection(runnerId: string, runnerToken: string): Promise<RunnerEntity> {
    const token = await this.registrationService.verifyToken(runnerToken);
    const runner = await this.runnerRepository.findOne({ where: { runnerId } });
    if (!runner) {
      throw new NotFoundError(`Runner not found: ${runnerId}`);
    }
    if (runner.ownerUserId !== token.ownerUserId) {
      throw new AppError(403, 'RUNNER_OWNER_MISMATCH', 'Runner owner does not match token owner');
    }

    runner.status = 'online';
    runner.lastSeenAt = new Date();
    if (!runner.tokenId) {
      runner.tokenId = token.tokenId;
    }
    return this.runnerRepository.save(runner);
  }

  private async markStaleRunnersOffline(): Promise<void> {
    const threshold = new Date(Date.now() - this.offlineTimeoutMs);
    await this.runnerRepository
      .createQueryBuilder()
      .update(RunnerEntity)
      .set({ status: 'offline' })
      .where('status = :status', { status: 'online' })
      .andWhere('last_seen_at IS NULL OR last_seen_at < :threshold', { threshold })
      .execute();
  }
}

function createRunnerId(): string {
  return `runner_${randomUUID()}`;
}

function normalizeText(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}
