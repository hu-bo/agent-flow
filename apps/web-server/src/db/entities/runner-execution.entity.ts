import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export type RunnerExecutionState = 'accepted' | 'running' | 'terminal';
export type RunnerExecutionTerminalStatus = 'succeeded' | 'failed' | 'cancelled' | 'timed_out' | 'rejected';

@Entity({ name: 'runner_execution' })
@Index('idx_runner_execution_task_id', ['taskId'])
@Index('idx_runner_execution_runner_state', ['runnerId', 'state'])
export class RunnerExecutionEntity {
  @PrimaryColumn({ name: 'execution_id', type: 'varchar', length: 256 })
  executionId!: string;

  @PrimaryColumn({ type: 'integer' })
  attempt!: number;

  @Column({ name: 'task_id', type: 'varchar', length: 256 })
  taskId!: string;

  @Column({ name: 'runner_id', type: 'varchar', length: 128 })
  runnerId!: string;

  @Column({ type: 'varchar', length: 16, default: 'accepted' })
  state!: RunnerExecutionState;

  @Column({ name: 'terminal_status', type: 'varchar', length: 16, nullable: true })
  terminalStatus!: RunnerExecutionTerminalStatus | null;

  @Column({ name: 'failure_type', type: 'varchar', length: 64, nullable: true })
  failureType!: string | null;

  @Column({ name: 'failure_message', type: 'text', nullable: true })
  failureMessage!: string | null;

  @Column({ name: 'task_payload', type: 'jsonb' })
  taskPayload!: Record<string, unknown>;

  @Column({ name: 'dispatch_acked', type: 'boolean', default: false })
  dispatchAcked!: boolean;

  @Column({ name: 'cancel_requested', type: 'boolean', default: false })
  cancelRequested!: boolean;

  @Column({ name: 'last_event_sequence', type: 'bigint', default: 0 })
  lastEventSequence!: string;

  @Column({ type: 'timestamptz' })
  deadline!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
