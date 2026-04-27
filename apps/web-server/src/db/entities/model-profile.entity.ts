import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RoutingPolicyEntity } from './routing-policy.entity.js';

export type ModelProfileStatus = 'active' | 'disabled';

@Entity({ name: 'model_profile' })
export class ModelProfileEntity {
  @PrimaryColumn({ name: 'profile_id', type: 'varchar', length: 64 })
  profileId!: string;

  @Column({ name: 'display_name', type: 'varchar', length: 128 })
  displayName!: string;

  @Column({ name: 'intent_tags', type: 'jsonb', default: () => "'[]'::jsonb" })
  intentTags!: string[];

  @Column({ type: 'jsonb', nullable: true })
  sla!: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status!: ModelProfileStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => RoutingPolicyEntity, (policy) => policy.profile)
  policies!: RoutingPolicyEntity[];
}
