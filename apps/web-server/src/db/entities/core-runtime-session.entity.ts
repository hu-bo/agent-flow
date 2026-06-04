import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'core_runtime_session' })
@Index('idx_core_runtime_session_task_id', ['taskId'])
@Index('idx_core_runtime_session_status_updated_at', ['status', 'updatedAt'])
export class CoreRuntimeSessionEntity {
  @PrimaryColumn({ name: 'session_id', type: 'varchar', length: 128 })
  sessionId!: string;

  @Column({ name: 'task_id', type: 'varchar', length: 128 })
  taskId!: string;

  @Column({ type: 'varchar', length: 32 })
  status!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'last_request', type: 'jsonb', nullable: true })
  lastRequest!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
