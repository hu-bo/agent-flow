import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type RunnerApprovalScopeType = 'project' | 'chat';

@Entity({ name: 'runner_approval_grant' })
@Index('idx_runner_approval_grant_owner_active', ['ownerUserId', 'revokedAt'])
export class RunnerApprovalGrantEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'grant_id' })
  grantId!: string;

  @Column({ name: 'owner_user_id', type: 'varchar', length: 128 })
  ownerUserId!: string;

  @Column({ name: 'runner_id', type: 'varchar', length: 128 })
  runnerId!: string;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId!: string | null;

  @Column({ name: 'chat_session_id', type: 'uuid', nullable: true })
  chatSessionId!: string | null;

  @Column({ type: 'varchar', length: 32, default: 'all_high_risk' })
  coverage!: 'all_high_risk';

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true })
  lastUsedAt!: Date | null;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt!: Date | null;
}
