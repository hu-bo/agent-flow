import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'core_runtime_replay' })
@Index('idx_core_runtime_replay_session_cursor', ['sessionId', 'cursor'])
export class CoreRuntimeReplayEntity {
  @PrimaryColumn({ name: 'replay_id', type: 'varchar', length: 128 })
  replayId!: string;

  @Column({ name: 'session_id', type: 'varchar', length: 128 })
  sessionId!: string;

  @Column({ type: 'integer' })
  cursor!: number;

  @Column({ type: 'jsonb' })
  event!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
