import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitModelConfig20260426000100 implements MigrationInterface {
  name = 'InitModelConfig20260426000100';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "provider" (
        "provider_id" SERIAL PRIMARY KEY,
        "name" VARCHAR(64) NOT NULL UNIQUE,
        "type" VARCHAR(64) NOT NULL,
        "status" VARCHAR(16) NOT NULL DEFAULT 'active',
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "provider_credential" (
        "credential_id" BIGSERIAL PRIMARY KEY,
        "provider_id" INTEGER NOT NULL REFERENCES "provider"("provider_id") ON DELETE CASCADE,
        "secret_ref" VARCHAR(255) NOT NULL,
        "key_version" INTEGER NOT NULL DEFAULT 1,
        "status" VARCHAR(16) NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "uq_provider_credential_secret_ref" UNIQUE ("provider_id", "secret_ref")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "provider_model" (
        "model_id" VARCHAR(128) PRIMARY KEY,
        "provider_id" INTEGER NOT NULL REFERENCES "provider"("provider_id") ON DELETE CASCADE,
        "display_name" VARCHAR(128) NOT NULL,
        "token_limit" INTEGER NOT NULL,
        "status" VARCHAR(16) NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "model_profile" (
        "profile_id" VARCHAR(64) PRIMARY KEY,
        "display_name" VARCHAR(128) NOT NULL,
        "intent_tags" JSONB NOT NULL DEFAULT '[]'::jsonb,
        "sla" JSONB NULL,
        "status" VARCHAR(16) NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "routing_policy" (
        "policy_id" VARCHAR(64) PRIMARY KEY,
        "profile_id" VARCHAR(64) NOT NULL REFERENCES "model_profile"("profile_id") ON DELETE CASCADE,
        "primary_model_id" VARCHAR(128) NOT NULL REFERENCES "provider_model"("model_id") ON DELETE RESTRICT,
        "fallbacks" JSONB NOT NULL DEFAULT '[]'::jsonb,
        "strategy" VARCHAR(32) NOT NULL DEFAULT 'priority',
        "status" VARCHAR(16) NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "uq_routing_policy_profile_id" UNIQUE ("profile_id")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_log" (
        "audit_id" BIGSERIAL PRIMARY KEY,
        "actor" VARCHAR(128) NULL,
        "action" VARCHAR(128) NOT NULL,
        "resource" VARCHAR(128) NOT NULL,
        "resource_id" VARCHAR(128) NULL,
        "request_id" VARCHAR(128) NULL,
        "before" JSONB NULL,
        "after" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_provider_model_provider_id" ON "provider_model" ("provider_id");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_provider_credential_provider_id" ON "provider_credential" ("provider_id");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_routing_policy_primary_model_id" ON "routing_policy" ("primary_model_id");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_audit_log_created_at" ON "audit_log" ("created_at");
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_log";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "routing_policy";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "model_profile";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "provider_model";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "provider_credential";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "provider";`);
  }
}
