import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRunnerExecutionJournal20260729000300 implements MigrationInterface {
  name = 'AddRunnerExecutionJournal20260729000300';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "runner_execution" (
        "execution_id" VARCHAR(256) NOT NULL,
        "attempt" INTEGER NOT NULL,
        "task_id" VARCHAR(256) NOT NULL,
        "runner_id" VARCHAR(128) NOT NULL REFERENCES "runner"("runner_id") ON DELETE CASCADE,
        "state" VARCHAR(16) NOT NULL DEFAULT 'accepted',
        "terminal_status" VARCHAR(16) NULL,
        "failure_type" VARCHAR(64) NULL,
        "failure_message" TEXT NULL,
        "task_payload" JSONB NOT NULL,
        "dispatch_acked" BOOLEAN NOT NULL DEFAULT FALSE,
        "cancel_requested" BOOLEAN NOT NULL DEFAULT FALSE,
        "last_event_sequence" BIGINT NOT NULL DEFAULT 0,
        "deadline" TIMESTAMPTZ NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY ("execution_id", "attempt"),
        CONSTRAINT "ck_runner_execution_state" CHECK ("state" IN ('accepted', 'running', 'terminal')),
        CONSTRAINT "ck_runner_execution_terminal_status" CHECK (
          "terminal_status" IS NULL OR "terminal_status" IN ('succeeded', 'failed', 'cancelled', 'timed_out', 'rejected')
        )
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_runner_execution_task_id" ON "runner_execution" ("task_id");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_runner_execution_runner_state" ON "runner_execution" ("runner_id", "state");`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "runner_execution_event" (
        "execution_id" VARCHAR(256) NOT NULL,
        "attempt" INTEGER NOT NULL,
        "event_sequence" BIGINT NOT NULL,
        "task_id" VARCHAR(256) NOT NULL,
        "runner_id" VARCHAR(128) NOT NULL,
        "event_type" VARCHAR(32) NOT NULL,
        "payload" JSONB NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY ("execution_id", "attempt", "event_sequence"),
        FOREIGN KEY ("execution_id", "attempt")
          REFERENCES "runner_execution"("execution_id", "attempt") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_runner_execution_event_created_at" ON "runner_execution_event" ("created_at");`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "runner_execution_event";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "runner_execution";`);
  }
}
