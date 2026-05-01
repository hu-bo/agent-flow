import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRunnerHostInfo20260501000300 implements MigrationInterface {
  name = 'AddRunnerHostInfo20260501000300';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "runner" ADD COLUMN IF NOT EXISTS "host_name" VARCHAR(255) NULL;`);
    await queryRunner.query(`ALTER TABLE "runner" ADD COLUMN IF NOT EXISTS "host_ip" VARCHAR(64) NULL;`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "runner" DROP COLUMN IF EXISTS "host_ip";`);
    await queryRunner.query(`ALTER TABLE "runner" DROP COLUMN IF EXISTS "host_name";`);
  }
}
