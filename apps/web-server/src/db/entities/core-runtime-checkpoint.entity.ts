import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'core_runtime_checkpoint' })
@Index('idx_core_runtime_checkpoint_session_created_at', ['sessionId', 'createdAt'])
export class CoreRuntimeCheckpointEntity {
  @PrimaryColumn({ name: 'checkpoint_id', type: 'varchar', length: 128 })
  checkpointId!: string;

  @Column({ name: 'session_id', type: 'varchar', length: 128 })
  sessionId!: string;

  @Column({ name: 'step_id', type: 'varchar', length: 128 })
  stepId!: string;

  @Column({ type: 'jsonb' })
  output!: unknown;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
