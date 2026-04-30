import type { EntityManager } from 'typeorm';
import type { AppDataSource } from '../db/data-source.js';
import { AuditLogEntity } from '../db/entities/audit-log.entity.js';
import type {
  AuditLogRecord,
  ListAuditLogsQuery,
  SwitchModelOptions,
} from './model-admin-contracts.js';

export interface AuditLogPayload {
  action: string;
  resource: string;
  resourceId?: string | null;
  before?: unknown;
  after?: unknown;
}

export class ModelAdminAuditService {
  constructor(private readonly db: AppDataSource) {}

  async writeAuditLog(
    manager: EntityManager,
    options: SwitchModelOptions,
    payload: AuditLogPayload,
  ) {
    const auditLogRepository = manager.getRepository(AuditLogEntity);
    await auditLogRepository.save(
      auditLogRepository.create({
        actor: options.actorId ?? null,
        action: payload.action,
        resource: payload.resource,
        resourceId: payload.resourceId ?? null,
        requestId: options.requestId ?? null,
        before: normalizeAuditValue(payload.before),
        after: normalizeAuditValue(payload.after),
      }),
    );
  }

  async listAuditLogs(query: ListAuditLogsQuery = {}): Promise<AuditLogRecord[]> {
    const auditLogRepository = this.db.getRepository(AuditLogEntity);
    const builder = auditLogRepository
      .createQueryBuilder('audit')
      .orderBy('audit.created_at', 'DESC')
      .take(Math.min(Math.max(query.limit ?? 50, 1), 200));

    if (query.actor) {
      builder.andWhere('audit.actor = :actor', {
        actor: query.actor,
      });
    }
    if (query.action) {
      builder.andWhere('audit.action = :action', {
        action: query.action,
      });
    }
    if (query.resource) {
      builder.andWhere('audit.resource = :resource', {
        resource: query.resource,
      });
    }

    const logs = await builder.getMany();
    return logs.map((log) => this.toAuditLogRecord(log));
  }

  private toAuditLogRecord(log: AuditLogEntity): AuditLogRecord {
    return {
      auditId: log.auditId,
      actor: log.actor,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      requestId: log.requestId,
      before: log.before,
      after: log.after,
      createdAt: toIso(log.createdAt),
    };
  }
}

function toIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}

function normalizeAuditValue(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}
