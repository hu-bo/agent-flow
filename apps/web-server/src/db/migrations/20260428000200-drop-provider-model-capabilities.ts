import type { MigrationInterface, QueryRunner } from 'typeorm';

export class DropProviderModelCapabilities20260428000200 implements MigrationInterface {
  name = 'DropProviderModelCapabilities20260428000200';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "provider_model"
      DROP COLUMN IF EXISTS "capabilities";
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "provider_model"
      ADD COLUMN IF NOT EXISTS "capabilities" JSONB NOT NULL DEFAULT '[]'::jsonb;
    `);
  }
}
