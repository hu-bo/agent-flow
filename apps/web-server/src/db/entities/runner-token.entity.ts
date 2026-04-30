import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type RunnerTokenStatus = 'active' | 'revoked';

@Entity({ name: 'runner_token' })
@Index('idx_runner_token_owner_status', ['ownerUserId', 'status'])
export class RunnerTokenEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'token_id' })
  tokenId!: string;

  @Column({ name: 'owner_user_id', type: 'varchar', length: 128 })
  ownerUserId!: string;

  @Column({ name: 'token_hash', type: 'varchar', length: 128 })
  tokenHash!: string;

  @Column({ name: 'token_prefix', type: 'varchar', length: 16 })
  tokenPrefix!: string;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status!: RunnerTokenStatus;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

