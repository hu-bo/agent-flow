import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCoreRuntimePersistence20260602000100 implements MigrationInterface {
  name = 'AddCoreRuntimePersistence20260602000100';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "core_runtime_session" (
        "session_id" VARCHAR(128) PRIMARY KEY,
        "task_id" VARCHAR(128) NOT NULL,
        "status" VARCHAR(32) NOT NULL,
        "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
        "last_request" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_core_runtime_session_task_id"
      ON "core_runtime_session" ("task_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_core_runtime_session_status_updated_at"
      ON "core_runtime_session" ("status", "updated_at");
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "core_runtime_checkpoint" (
        "checkpoint_id" VARCHAR(128) PRIMARY KEY,
        "session_id" VARCHAR(128) NOT NULL REFERENCES "core_runtime_session"("session_id") ON DELETE CASCADE,
        "step_id" VARCHAR(128) NOT NULL,
        "output" JSONB NOT NULL,
        "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_core_runtime_checkpoint_session_created_at"
      ON "core_runtime_checkpoint" ("session_id", "created_at");
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "core_runtime_replay" (
        "replay_id" VARCHAR(128) PRIMARY KEY,
        "session_id" VARCHAR(128) NOT NULL REFERENCES "core_runtime_session"("session_id") ON DELETE CASCADE,
        "cursor" INTEGER NOT NULL,
        "event" JSONB NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_core_runtime_replay_session_cursor"
      ON "core_runtime_replay" ("session_id", "cursor");
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "core_runtime_replay";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "core_runtime_checkpoint";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "core_runtime_session";`);
  }
}
