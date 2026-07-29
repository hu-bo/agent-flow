import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'runner_execution_event' })
@Index('idx_runner_execution_event_created_at', ['createdAt'])
export class RunnerExecutionEventEntity {
  @PrimaryColumn({ name: 'execution_id', type: 'varchar', length: 256 })
  executionId!: string;

  @PrimaryColumn({ type: 'integer' })
  attempt!: number;

  @PrimaryColumn({ name: 'event_sequence', type: 'bigint' })
  eventSequence!: string;

  @Column({ name: 'task_id', type: 'varchar', length: 256 })
  taskId!: string;

  @Column({ name: 'runner_id', type: 'varchar', length: 128 })
  runnerId!: string;

  @Column({ name: 'event_type', type: 'varchar', length: 32 })
  eventType!: string;

  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
