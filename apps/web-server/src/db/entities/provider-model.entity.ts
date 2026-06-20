import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { ProviderEntity } from './provider.entity.js';

export type ProviderModelStatus = 'active' | 'disabled';

@Entity({ name: 'provider_model' })
export class ProviderModelEntity {
  @PrimaryGeneratedColumn({ name: 'model_id', type: 'integer' })
  modelId!: number;

  @Column({ type: 'varchar', length: 128 })
  model!: string;

  @Column({ name: 'provider_id', type: 'integer' })
  providerId!: number;

  @ManyToOne(() => ProviderEntity, (provider) => provider.models, {
    createForeignKeyConstraints: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'provider_id', referencedColumnName: 'providerId' })
  provider!: Relation<ProviderEntity>;

  @Column({ name: 'display_name', type: 'varchar', length: 128 })
  displayName!: string;

  @Column({ name: 'token_limit', type: 'integer' })
  tokenLimit!: number;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status!: ProviderModelStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
