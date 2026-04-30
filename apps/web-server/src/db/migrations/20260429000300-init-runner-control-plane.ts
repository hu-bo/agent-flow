import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitRunnerControlPlane20260429000300 implements MigrationInterface {
  name = 'InitRunnerControlPlane20260429000300';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "runner_token" (
        "token_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "owner_user_id" VARCHAR(128) NOT NULL REFERENCES "user_account"("user_id") ON DELETE CASCADE,
        "token_hash" VARCHAR(128) NOT NULL,
        "token_prefix" VARCHAR(16) NOT NULL,
        "status" VARCHAR(16) NOT NULL DEFAULT 'active',
        "revoked_at" TIMESTAMPTZ NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_runner_token_owner_status"
      ON "runner_token" ("owner_user_id", "status");
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "runner" (
        "runner_id" VARCHAR(128) PRIMARY KEY,
        "owner_user_id" VARCHAR(128) NOT NULL REFERENCES "user_account"("user_id") ON DELETE CASCADE,
        "token_id" UUID NULL REFERENCES "runner_token"("token_id") ON DELETE SET NULL,
        "kind" VARCHAR(16) NOT NULL DEFAULT 'local',
        "status" VARCHAR(16) NOT NULL DEFAULT 'offline',
        "host" VARCHAR(255) NULL,
        "version" VARCHAR(64) NULL,
        "capabilities" JSONB NOT NULL DEFAULT '[]'::jsonb,
        "last_seen_at" TIMESTAMPTZ NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_runner_owner_status"
      ON "runner" ("owner_user_id", "status");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_runner_last_seen_at"
      ON "runner" ("last_seen_at");
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "runner";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "runner_token";`);
  }
}
