import { basename } from 'node:path';
import type { Repository } from 'typeorm';
import type { AppDataSource } from '../db/data-source.js';
import { ChatSessionEntity } from '../db/entities/chat-session.entity.js';
import { ProjectEntity } from '../db/entities/project.entity.js';
import type { ProjectRecord } from '../contracts/api.js';
import { AppError, NotFoundError } from '../lib/errors.js';
import { RunnerRegistryService } from './runner-registry-service.js';
import { toSessionRecord } from './session-service.js';

interface CreateProjectInput {
  ownerUserId: string;
  name?: string;
  rootPath: string;
  runnerId: string;
}

interface UpdateProjectInput {
  ownerUserId: string;
  projectId: string;
  name?: string;
  rootPath?: string;
  defaultRunnerId?: string;
}

export class ProjectService {
  private readonly projectRepository: Repository<ProjectEntity>;
  private readonly sessionRepository: Repository<ChatSessionEntity>;

  constructor(
    db: AppDataSource,
    private readonly runnerRegistryService: RunnerRegistryService,
  ) {
    this.projectRepository = db.getRepository(ProjectEntity);
    this.sessionRepository = db.getRepository(ChatSessionEntity);
  }

  async listProjects(ownerUserId: string): Promise<ProjectRecord[]> {
    const projects = await this.projectRepository.find({
      where: { ownerUserId },
      order: { updatedAt: 'DESC' },
    });
    return Promise.all(projects.map((project) => this.toProjectRecord(project)));
  }

  async createProject(input: CreateProjectInput): Promise<ProjectRecord> {
    await this.ensureOnlineRunner(input.ownerUserId, input.runnerId);
    const rootPath = input.rootPath.trim();
    const entity = this.projectRepository.create({
      ownerUserId: input.ownerUserId,
      name: normalizeProjectName(input.name) ?? deriveProjectName(rootPath),
      rootPath,
      defaultRunnerId: input.runnerId,
    });
    try {
      return this.toProjectRecord(await this.projectRepository.save(entity));
    } catch (error) {
      if (isDuplicateError(error)) {
        throw new AppError(409, 'PROJECT_EXISTS', 'Project already exists for this runner and directory');
      }
      throw error;
    }
  }

  async updateProject(input: UpdateProjectInput): Promise<ProjectRecord> {
    const project = await this.getProjectEntity(input.ownerUserId, input.projectId);
    if (input.defaultRunnerId) {
      await this.ensureOnlineRunner(input.ownerUserId, input.defaultRunnerId);
      project.defaultRunnerId = input.defaultRunnerId;
    }
    if (input.rootPath) {
      project.rootPath = input.rootPath.trim();
      await this.sessionRepository.update(
        { projectId: project.projectId },
        { cwd: project.rootPath },
      );
    }
    if (input.name) {
      project.name = input.name.trim();
    }
    return this.toProjectRecord(await this.projectRepository.save(project));
  }

  async deleteProject(ownerUserId: string, projectId: string): Promise<void> {
    const project = await this.getProjectEntity(ownerUserId, projectId);
    await this.projectRepository.delete({ projectId: project.projectId });
  }

  async getProject(ownerUserId: string, projectId: string): Promise<ProjectRecord> {
    return this.toProjectRecord(await this.getProjectEntity(ownerUserId, projectId));
  }

  private async getProjectEntity(ownerUserId: string, projectId: string): Promise<ProjectEntity> {
    const project = await this.projectRepository.findOne({ where: { ownerUserId, projectId } });
    if (!project) {
      throw new NotFoundError(`Project not found: ${projectId}`);
    }
    return project;
  }

  private async ensureOnlineRunner(ownerUserId: string, runnerId: string): Promise<void> {
    const runner = await this.runnerRegistryService.getRunnerForUser(ownerUserId, runnerId);
    if (runner.status !== 'online') {
      throw new AppError(409, 'RUNNER_OFFLINE', `Runner is offline: ${runner.runnerId}`);
    }
  }

  private async toProjectRecord(project: ProjectEntity): Promise<ProjectRecord> {
    const [chatCount, latestSession] = await Promise.all([
      this.sessionRepository.count({ where: { projectId: project.projectId } }),
      this.sessionRepository.findOne({
        where: { projectId: project.projectId },
        order: { updatedAt: 'DESC' },
      }),
    ]);
    return {
      projectId: project.projectId,
      name: project.name,
      rootPath: project.rootPath,
      defaultRunnerId: project.defaultRunnerId,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      chatCount,
      ...(latestSession ? { latestSession: toSessionRecord(latestSession) } : {}),
    };
  }
}

function normalizeProjectName(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

function deriveProjectName(rootPath: string): string {
  const normalized = rootPath.replace(/[\\/]+$/, '');
  return basename(normalized) || normalized || 'Project';
}

function isDuplicateError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === '23505'
  );
}
