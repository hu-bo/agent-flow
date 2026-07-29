import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRunnerCapacityProfile20260729000400 implements MigrationInterface {
  name = 'AddRunnerCapacityProfile20260729000400';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "runner" ADD COLUMN IF NOT EXISTS "capability_schema_version" INTEGER NOT NULL DEFAULT 1;`);
    await queryRunner.query(`ALTER TABLE "runner" ADD COLUMN IF NOT EXISTS "isolation_level" VARCHAR(32) NOT NULL DEFAULT 'guarded-host';`);
    await queryRunner.query(`ALTER TABLE "runner" ADD COLUMN IF NOT EXISTS "available_engines" JSONB NOT NULL DEFAULT '["host"]'::jsonb;`);
    await queryRunner.query(`ALTER TABLE "runner" ADD COLUMN IF NOT EXISTS "logical_cpu_count" INTEGER NOT NULL DEFAULT 0;`);
    await queryRunner.query(`ALTER TABLE "runner" ADD COLUMN IF NOT EXISTS "memory_bytes" BIGINT NOT NULL DEFAULT 0;`);
    await queryRunner.query(`ALTER TABLE "runner" ADD COLUMN IF NOT EXISTS "max_concurrent_tasks" INTEGER NOT NULL DEFAULT 1;`);
    await queryRunner.query(`ALTER TABLE "runner" ADD COLUMN IF NOT EXISTS "active_tasks" INTEGER NOT NULL DEFAULT 0;`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "runner" DROP COLUMN IF EXISTS "active_tasks";`);
    await queryRunner.query(`ALTER TABLE "runner" DROP COLUMN IF EXISTS "max_concurrent_tasks";`);
    await queryRunner.query(`ALTER TABLE "runner" DROP COLUMN IF EXISTS "memory_bytes";`);
    await queryRunner.query(`ALTER TABLE "runner" DROP COLUMN IF EXISTS "logical_cpu_count";`);
    await queryRunner.query(`ALTER TABLE "runner" DROP COLUMN IF EXISTS "available_engines";`);
    await queryRunner.query(`ALTER TABLE "runner" DROP COLUMN IF EXISTS "isolation_level";`);
    await queryRunner.query(`ALTER TABLE "runner" DROP COLUMN IF EXISTS "capability_schema_version";`);
  }
}
