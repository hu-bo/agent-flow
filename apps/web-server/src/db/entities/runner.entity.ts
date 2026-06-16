import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export type RunnerKind = 'local' | 'remote' | 'sandbox';
export type RunnerStatus = 'online' | 'offline';

@Entity({ name: 'runner' })
@Index('idx_runner_owner_status', ['ownerUserId', 'status'])
@Index('idx_runner_last_seen_at', ['lastSeenAt'])
export class RunnerEntity {
  @PrimaryColumn({ name: 'runner_id', type: 'varchar', length: 128 })
  runnerId!: string;

  @Column({ name: 'owner_user_id', type: 'varchar', length: 128 })
  ownerUserId!: string;

  @Column({ name: 'token_id', type: 'uuid', nullable: true })
  tokenId!: string | null;

  @Column({ type: 'varchar', length: 16, default: 'local' })
  kind!: RunnerKind;

  @Column({ type: 'varchar', length: 16, default: 'offline' })
  status!: RunnerStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  host!: string | null;

  @Column({ name: 'host_name', type: 'varchar', length: 255, nullable: true })
  hostName!: string | null;

  @Column({ name: 'host_ip', type: 'varchar', length: 64, nullable: true })
  hostIp!: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  version!: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  capabilities!: string[];

  @Column({ type: 'varchar', length: 32, nullable: true })
  os!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  arch!: string | null;

  @Column({ name: 'default_shell', type: 'varchar', length: 128, nullable: true })
  defaultShell!: string | null;

  @Column({ name: 'path_separator', type: 'varchar', length: 8, nullable: true })
  pathSeparator!: string | null;

  @Column({ name: 'line_ending', type: 'varchar', length: 8, nullable: true })
  lineEnding!: string | null;

  @Column({ name: 'workspace_roots', type: 'jsonb', default: () => "'[]'::jsonb" })
  workspaceRoots!: string[];

  @Column({ name: 'available_commands', type: 'jsonb', default: () => "'[]'::jsonb" })
  availableCommands!: string[];

  @Column({ name: 'last_seen_at', type: 'timestamptz', nullable: true })
  lastSeenAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
