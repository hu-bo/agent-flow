import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitProjectChatPersistence20260511000100 implements MigrationInterface {
  name = 'InitProjectChatPersistence20260511000100';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "project" (
        "project_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "owner_user_id" VARCHAR(128) NOT NULL REFERENCES "user_account"("user_id") ON DELETE CASCADE,
        "name" VARCHAR(255) NOT NULL,
        "root_path" VARCHAR(2048) NOT NULL,
        "default_runner_id" VARCHAR(128) NOT NULL REFERENCES "runner"("runner_id") ON DELETE RESTRICT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "uq_project_owner_runner_root" UNIQUE ("owner_user_id", "default_runner_id", "root_path")
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_project_owner_updated_at"
      ON "project" ("owner_user_id", "updated_at");
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "chat_session" (
        "session_id" UUID PRIMARY KEY,
        "owner_user_id" VARCHAR(128) NOT NULL REFERENCES "user_account"("user_id") ON DELETE CASCADE,
        "project_id" UUID NULL REFERENCES "project"("project_id") ON DELETE CASCADE,
        "title" VARCHAR(255) NULL,
        "model_id" INTEGER NOT NULL,
        "mode" VARCHAR(16) NOT NULL,
        "cwd" VARCHAR(2048) NOT NULL,
        "message_count" INTEGER NOT NULL DEFAULT 0,
        "system_prompt" TEXT NULL,
        "latest_checkpoint_id" VARCHAR(128) NULL,
        "bound_runner_id" VARCHAR(128) NULL REFERENCES "runner"("runner_id") ON DELETE SET NULL,
        "spec_workflow" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_chat_session_owner_updated_at"
      ON "chat_session" ("owner_user_id", "updated_at");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_chat_session_project_updated_at"
      ON "chat_session" ("project_id", "updated_at");
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "chat_message" (
        "message_id" VARCHAR(128) PRIMARY KEY,
        "session_id" UUID NOT NULL REFERENCES "chat_session"("session_id") ON DELETE CASCADE,
        "sequence" INTEGER NOT NULL,
        "role" VARCHAR(32) NOT NULL,
        "timestamp" TIMESTAMPTZ NOT NULL,
        "payload" JSONB NOT NULL,
        CONSTRAINT "uq_chat_message_session_sequence" UNIQUE ("session_id", "sequence")
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_chat_message_session_sequence"
      ON "chat_message" ("session_id", "sequence");
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "chat_message";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "chat_session";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "project";`);
  }
}
