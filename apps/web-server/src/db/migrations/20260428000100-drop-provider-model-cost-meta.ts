import type { MigrationInterface, QueryRunner } from 'typeorm';

export class DropProviderModelCostMeta20260428000100 implements MigrationInterface {
  name = 'DropProviderModelCostMeta20260428000100';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "provider_model"
      DROP COLUMN IF EXISTS "cost_meta";
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "provider_model"
      ADD COLUMN IF NOT EXISTS "cost_meta" JSONB NULL;
    `);
  }
}
