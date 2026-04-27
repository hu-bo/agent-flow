import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProviderCredentialEntity } from './provider-credential.entity.js';
import { ProviderModelEntity } from './provider-model.entity.js';

export type ProviderStatus = 'active' | 'disabled';

@Entity({ name: 'provider' })
export class ProviderEntity {
  @PrimaryGeneratedColumn({ name: 'provider_id', type: 'integer' })
  providerId!: number;

  @Column({ type: 'varchar', length: 64, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 64 })
  type!: string;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status!: ProviderStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => ProviderCredentialEntity, (credential) => credential.provider)
  credentials!: ProviderCredentialEntity[];

  @OneToMany(() => ProviderModelEntity, (model) => model.provider)
  models!: ProviderModelEntity[];
}
