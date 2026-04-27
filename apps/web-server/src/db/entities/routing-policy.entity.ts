import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ModelProfileEntity } from './model-profile.entity.js';
import { ProviderModelEntity } from './provider-model.entity.js';

export type RoutingPolicyStatus = 'active' | 'disabled';

@Entity({ name: 'routing_policy' })
@Index('uq_routing_policy_profile_id', ['profileId'], { unique: true })
export class RoutingPolicyEntity {
  @PrimaryColumn({ name: 'policy_id', type: 'varchar', length: 64 })
  policyId!: string;

  @Column({ name: 'profile_id', type: 'varchar', length: 64 })
  profileId!: string;

  @ManyToOne(() => ModelProfileEntity, (profile) => profile.policies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id', referencedColumnName: 'profileId' })
  profile!: ModelProfileEntity;

  @Column({ name: 'primary_model_id', type: 'varchar', length: 128 })
  primaryModelId!: string;

  @ManyToOne(() => ProviderModelEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'primary_model_id', referencedColumnName: 'modelId' })
  primaryModel!: ProviderModelEntity;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  fallbacks!: string[];

  @Column({ type: 'varchar', length: 32, default: 'priority' })
  strategy!: string;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status!: RoutingPolicyStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
