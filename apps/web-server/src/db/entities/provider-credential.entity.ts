import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ProviderEntity } from './provider.entity.js';

export type ProviderCredentialStatus = 'active' | 'disabled';

@Entity({ name: 'provider_credential' })
@Unique('uq_provider_credential_secret_ref', ['providerId', 'secretRef'])
export class ProviderCredentialEntity {
  @PrimaryGeneratedColumn({ name: 'credential_id', type: 'bigint' })
  credentialId!: string;

  @Column({ name: 'provider_id', type: 'integer' })
  providerId!: number;

  @ManyToOne(() => ProviderEntity, (provider) => provider.credentials, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id', referencedColumnName: 'providerId' })
  provider!: ProviderEntity;

  @Column({ name: 'secret_ref', type: 'varchar', length: 255 })
  secretRef!: string;

  @Column({ name: 'key_version', type: 'integer', default: 1 })
  keyVersion!: number;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status!: ProviderCredentialStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
