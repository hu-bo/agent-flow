import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitUserAccount20260429000100 implements MigrationInterface {
  name = 'InitUserAccount20260429000100';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_account" (
        "user_id" BIGSERIAL PRIMARY KEY,
        "username" VARCHAR(32) NOT NULL UNIQUE,
        "password_hash" VARCHAR(255) NOT NULL,
        "role" VARCHAR(16) NOT NULL DEFAULT 'user',
        "status" VARCHAR(16) NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_user_account_role" ON "user_account" ("role");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_user_account_status" ON "user_account" ("status");
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_account";`);
  }
}
