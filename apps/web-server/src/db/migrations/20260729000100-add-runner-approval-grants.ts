import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRunnerApprovalGrants20260729000100 implements MigrationInterface {
  name = 'AddRunnerApprovalGrants20260729000100';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "runner_approval_grant" (
        "grant_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "owner_user_id" VARCHAR(128) NOT NULL REFERENCES "user_account"("user_id") ON DELETE CASCADE,
        "runner_id" VARCHAR(128) NOT NULL REFERENCES "runner"("runner_id") ON DELETE CASCADE,
        "project_id" UUID NULL REFERENCES "project"("project_id") ON DELETE CASCADE,
        "chat_session_id" UUID NULL REFERENCES "chat_session"("session_id") ON DELETE CASCADE,
        "coverage" VARCHAR(32) NOT NULL DEFAULT 'all_high_risk',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "last_used_at" TIMESTAMPTZ NULL,
        "revoked_at" TIMESTAMPTZ NULL,
        CONSTRAINT "ck_runner_approval_grant_scope" CHECK (
          ("project_id" IS NOT NULL AND "chat_session_id" IS NULL) OR
          ("project_id" IS NULL AND "chat_session_id" IS NOT NULL)
        ),
        CONSTRAINT "ck_runner_approval_grant_coverage" CHECK ("coverage" = 'all_high_risk')
      );
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_runner_approval_grant_owner_active"
      ON "runner_approval_grant" ("owner_user_id", "revoked_at");
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_runner_approval_grant_project_active"
      ON "runner_approval_grant" ("owner_user_id", "runner_id", "project_id")
      WHERE "project_id" IS NOT NULL AND "revoked_at" IS NULL;
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_runner_approval_grant_chat_active"
      ON "runner_approval_grant" ("owner_user_id", "runner_id", "chat_session_id")
      WHERE "chat_session_id" IS NOT NULL AND "revoked_at" IS NULL;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "runner_approval_grant";`);
  }
}
