import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRunnerPlatformProfile20260616000100 implements MigrationInterface {
  name = 'AddRunnerPlatformProfile20260616000100';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "runner" ADD COLUMN IF NOT EXISTS "os" VARCHAR(32) NULL;`);
    await queryRunner.query(`ALTER TABLE "runner" ADD COLUMN IF NOT EXISTS "arch" VARCHAR(32) NULL;`);
    await queryRunner.query(`ALTER TABLE "runner" ADD COLUMN IF NOT EXISTS "default_shell" VARCHAR(128) NULL;`);
    await queryRunner.query(`ALTER TABLE "runner" ADD COLUMN IF NOT EXISTS "path_separator" VARCHAR(8) NULL;`);
    await queryRunner.query(`ALTER TABLE "runner" ADD COLUMN IF NOT EXISTS "line_ending" VARCHAR(8) NULL;`);
    await queryRunner.query(`ALTER TABLE "runner" ADD COLUMN IF NOT EXISTS "workspace_roots" JSONB NOT NULL DEFAULT '[]'::jsonb;`);
    await queryRunner.query(`ALTER TABLE "runner" ADD COLUMN IF NOT EXISTS "available_commands" JSONB NOT NULL DEFAULT '[]'::jsonb;`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "runner" DROP COLUMN IF EXISTS "available_commands";`);
    await queryRunner.query(`ALTER TABLE "runner" DROP COLUMN IF EXISTS "workspace_roots";`);
    await queryRunner.query(`ALTER TABLE "runner" DROP COLUMN IF EXISTS "line_ending";`);
    await queryRunner.query(`ALTER TABLE "runner" DROP COLUMN IF EXISTS "path_separator";`);
    await queryRunner.query(`ALTER TABLE "runner" DROP COLUMN IF EXISTS "default_shell";`);
    await queryRunner.query(`ALTER TABLE "runner" DROP COLUMN IF EXISTS "arch";`);
    await queryRunner.query(`ALTER TABLE "runner" DROP COLUMN IF EXISTS "os";`);
  }
}
