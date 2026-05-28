import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ProjectDefaultRunnerNullable20260525000100 implements MigrationInterface {
  name = 'ProjectDefaultRunnerNullable20260525000100';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "project"
      DROP CONSTRAINT IF EXISTS "project_default_runner_id_fkey";
    `);

    await queryRunner.query(`
      ALTER TABLE "project"
      ALTER COLUMN "default_runner_id" DROP NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "project"
      ADD CONSTRAINT "project_default_runner_id_fkey"
      FOREIGN KEY ("default_runner_id")
      REFERENCES "runner"("runner_id")
      ON DELETE SET NULL;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "project"
      DROP CONSTRAINT IF EXISTS "project_default_runner_id_fkey";
    `);

    await queryRunner.query(`
      DELETE FROM "project"
      WHERE "default_runner_id" IS NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "project"
      ALTER COLUMN "default_runner_id" SET NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "project"
      ADD CONSTRAINT "project_default_runner_id_fkey"
      FOREIGN KEY ("default_runner_id")
      REFERENCES "runner"("runner_id")
      ON DELETE RESTRICT;
    `);
  }
}
