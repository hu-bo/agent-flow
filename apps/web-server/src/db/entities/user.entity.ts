import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'disabled';

@Entity({ name: 'user_account' })
@Index('idx_user_account_role', ['role'])
@Index('idx_user_account_status', ['status'])
export class UserEntity {
  @PrimaryColumn({ name: 'user_id', type: 'varchar', length: 128 })
  userId!: string;

  @Column({ type: 'varchar', length: 128, unique: true })
  username!: string;

  @Column({ name: 'display_name', type: 'varchar', length: 255, nullable: true })
  displayName!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string | null;

  @Column({ name: 'avatar_url', type: 'varchar', length: 1024, nullable: true })
  avatarUrl!: string | null;

  @Column({ type: 'varchar', length: 16, default: 'user' })
  role!: UserRole;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status!: UserStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
