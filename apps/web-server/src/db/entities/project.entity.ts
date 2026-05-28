import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'project' })
@Index('idx_project_owner_updated_at', ['ownerUserId', 'updatedAt'])
@Index('uq_project_owner_runner_root', ['ownerUserId', 'defaultRunnerId', 'rootPath'], { unique: true })
export class ProjectEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'project_id' })
  projectId!: string;

  @Column({ name: 'owner_user_id', type: 'varchar', length: 128 })
  ownerUserId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'root_path', type: 'varchar', length: 2048 })
  rootPath!: string;

  @Column({ name: 'default_runner_id', type: 'varchar', length: 128, nullable: true })
  defaultRunnerId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
