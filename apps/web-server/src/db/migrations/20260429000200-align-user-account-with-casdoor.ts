import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlignUserAccountWithCasdoor20260429000200 implements MigrationInterface {
  name = 'AlignUserAccountWithCasdoor20260429000200';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_account_casdoor" (
        "user_id" VARCHAR(128) PRIMARY KEY,
        "username" VARCHAR(128) NOT NULL UNIQUE,
        "display_name" VARCHAR(255) NULL,
        "email" VARCHAR(255) NULL,
        "avatar_url" VARCHAR(1024) NULL,
        "role" VARCHAR(16) NOT NULL DEFAULT 'user',
        "status" VARCHAR(16) NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      INSERT INTO "user_account_casdoor" ("user_id", "username", "role", "status", "created_at", "updated_at")
      SELECT CAST("user_id" AS VARCHAR(128)), "username", "role", "status", "created_at", "updated_at"
      FROM "user_account"
      ON CONFLICT ("user_id") DO NOTHING;
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS "user_account";`);
    await queryRunner.query(`ALTER TABLE "user_account_casdoor" RENAME TO "user_account";`);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_user_account_role" ON "user_account" ("role");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_user_account_status" ON "user_account" ("status");
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_account_legacy" (
        "user_id" BIGSERIAL PRIMARY KEY,
        "username" VARCHAR(32) NOT NULL UNIQUE,
        "password_hash" VARCHAR(255) NOT NULL DEFAULT '',
        "role" VARCHAR(16) NOT NULL DEFAULT 'user',
        "status" VARCHAR(16) NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      INSERT INTO "user_account_legacy" ("username", "role", "status", "created_at", "updated_at")
      SELECT LEFT("username", 32), "role", "status", "created_at", "updated_at"
      FROM "user_account";
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS "user_account";`);
    await queryRunner.query(`ALTER TABLE "user_account_legacy" RENAME TO "user_account";`);
  }
}
