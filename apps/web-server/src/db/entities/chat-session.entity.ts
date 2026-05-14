import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import type { SessionMode, SpecWorkflowState } from '../../contracts/api.js';

@Entity({ name: 'chat_session' })
@Index('idx_chat_session_owner_updated_at', ['ownerUserId', 'updatedAt'])
@Index('idx_chat_session_project_updated_at', ['projectId', 'updatedAt'])
export class ChatSessionEntity {
  @PrimaryColumn({ name: 'session_id', type: 'uuid' })
  sessionId!: string;

  @Column({ name: 'owner_user_id', type: 'varchar', length: 128 })
  ownerUserId!: string;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId!: string | null;

  @Column({ name: 'title', type: 'varchar', length: 255, nullable: true })
  title!: string | null;

  @Column({ name: 'model_id', type: 'integer' })
  modelId!: number;

  @Column({ type: 'varchar', length: 16 })
  mode!: SessionMode;

  @Column({ type: 'varchar', length: 2048 })
  cwd!: string;

  @Column({ name: 'message_count', type: 'integer', default: 0 })
  messageCount!: number;

  @Column({ name: 'system_prompt', type: 'text', nullable: true })
  systemPrompt!: string | null;

  @Column({ name: 'latest_checkpoint_id', type: 'varchar', length: 128, nullable: true })
  latestCheckpointId!: string | null;

  @Column({ name: 'bound_runner_id', type: 'varchar', length: 128, nullable: true })
  boundRunnerId!: string | null;

  @Column({ name: 'spec_workflow', type: 'jsonb', nullable: true })
  specWorkflow!: SpecWorkflowState | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
