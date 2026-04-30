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
    const runnerId = input.runnerId?.trim() || createRunnerId();
    const existing = await this.runnerRepository.findOne({ where: { runnerId } });
    if (existing && existing.ownerUserId !== token.ownerUserId) {
      throw new AppError(403, 'RUNNER_OWNER_MISMATCH', 'runner_id belongs to another user');
    }

    const runner = existing ?? this.runnerRepository.create({ runnerId });
    runner.ownerUserId = token.ownerUserId;
    runner.tokenId = token.tokenId;
    runner.kind = input.kind ?? existing?.kind ?? 'local';
    runner.status = 'online';
    runner.host = input.host ?? existing?.host ?? null;
    runner.version = input.version ?? existing?.version ?? null;
    runner.capabilities = input.capabilities ?? existing?.capabilities ?? [];
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
