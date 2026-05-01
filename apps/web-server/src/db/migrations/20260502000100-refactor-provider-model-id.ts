import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorProviderModelId20260502000100 implements MigrationInterface {
  name = 'RefactorProviderModelId20260502000100';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "routing_policy" DROP CONSTRAINT IF EXISTS "routing_policy_primary_model_id_fkey";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_routing_policy_primary_model_id";`);

    await queryRunner.query(`ALTER TABLE "provider_model" RENAME COLUMN "model_id" TO "legacy_model_id";`);
    await queryRunner.query(`ALTER TABLE "provider_model" ADD COLUMN "model_id" SERIAL;`);
    await queryRunner.query(`ALTER TABLE "provider_model" ADD COLUMN "model" VARCHAR(128);`);
    await queryRunner.query(`UPDATE "provider_model" SET "model" = "legacy_model_id";`);
    await queryRunner.query(`ALTER TABLE "provider_model" ALTER COLUMN "model" SET NOT NULL;`);
    await queryRunner.query(`ALTER TABLE "provider_model" DROP CONSTRAINT IF EXISTS "provider_model_pkey";`);
    await queryRunner.query(`ALTER TABLE "provider_model" ADD CONSTRAINT "provider_model_pkey" PRIMARY KEY ("model_id");`);
    await queryRunner.query(`ALTER TABLE "provider_model" ADD CONSTRAINT "uq_provider_model_provider_model" UNIQUE ("provider_id", "model");`);

    await queryRunner.query(`ALTER TABLE "routing_policy" ADD COLUMN "primary_model_id_next" INTEGER;`);
    await queryRunner.query(`
      UPDATE "routing_policy" policy
      SET "primary_model_id_next" = model."model_id"
      FROM "provider_model" model
      WHERE policy."primary_model_id" = model."legacy_model_id";
    `);
    await queryRunner.query(`ALTER TABLE "routing_policy" ALTER COLUMN "primary_model_id_next" SET NOT NULL;`);

    await queryRunner.query(`ALTER TABLE "routing_policy" ADD COLUMN "fallbacks_next" JSONB NOT NULL DEFAULT '[]'::jsonb;`);
    await queryRunner.query(`
      UPDATE "routing_policy" policy
      SET "fallbacks_next" = COALESCE(mapped."fallbacks", '[]'::jsonb)
      FROM (
        SELECT
          policy_inner."policy_id",
          jsonb_agg(model."model_id" ORDER BY fallback_items.ordinality) AS "fallbacks"
        FROM "routing_policy" policy_inner
        CROSS JOIN LATERAL jsonb_array_elements_text(policy_inner."fallbacks") WITH ORDINALITY AS fallback_items("legacy_model_id", ordinality)
        JOIN "provider_model" model ON model."legacy_model_id" = fallback_items."legacy_model_id"
        GROUP BY policy_inner."policy_id"
      ) mapped
      WHERE policy."policy_id" = mapped."policy_id";
    `);

    await queryRunner.query(`ALTER TABLE "routing_policy" DROP COLUMN "primary_model_id";`);
    await queryRunner.query(`ALTER TABLE "routing_policy" RENAME COLUMN "primary_model_id_next" TO "primary_model_id";`);
    await queryRunner.query(`ALTER TABLE "routing_policy" DROP COLUMN "fallbacks";`);
    await queryRunner.query(`ALTER TABLE "routing_policy" RENAME COLUMN "fallbacks_next" TO "fallbacks";`);
    await queryRunner.query(`
      ALTER TABLE "routing_policy"
      ADD CONSTRAINT "routing_policy_primary_model_id_fkey"
      FOREIGN KEY ("primary_model_id") REFERENCES "provider_model"("model_id") ON DELETE RESTRICT;
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_routing_policy_primary_model_id" ON "routing_policy" ("primary_model_id");`);

    await queryRunner.query(`ALTER TABLE "provider_model" DROP COLUMN "legacy_model_id";`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "routing_policy" DROP CONSTRAINT IF EXISTS "routing_policy_primary_model_id_fkey";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_routing_policy_primary_model_id";`);

    await queryRunner.query(`ALTER TABLE "provider_model" ADD COLUMN "legacy_model_id" VARCHAR(128);`);
    await queryRunner.query(`UPDATE "provider_model" SET "legacy_model_id" = "model";`);
    await queryRunner.query(`ALTER TABLE "provider_model" ALTER COLUMN "legacy_model_id" SET NOT NULL;`);

    await queryRunner.query(`ALTER TABLE "routing_policy" ADD COLUMN "primary_model_id_legacy" VARCHAR(128);`);
    await queryRunner.query(`
      UPDATE "routing_policy" policy
      SET "primary_model_id_legacy" = model."legacy_model_id"
      FROM "provider_model" model
      WHERE policy."primary_model_id" = model."model_id";
    `);
    await queryRunner.query(`ALTER TABLE "routing_policy" ALTER COLUMN "primary_model_id_legacy" SET NOT NULL;`);

    await queryRunner.query(`ALTER TABLE "routing_policy" ADD COLUMN "fallbacks_legacy" JSONB NOT NULL DEFAULT '[]'::jsonb;`);
    await queryRunner.query(`
      UPDATE "routing_policy" policy
      SET "fallbacks_legacy" = COALESCE(mapped."fallbacks", '[]'::jsonb)
      FROM (
        SELECT
          policy_inner."policy_id",
          jsonb_agg(model."legacy_model_id" ORDER BY fallback_items.ordinality) AS "fallbacks"
        FROM "routing_policy" policy_inner
        CROSS JOIN LATERAL jsonb_array_elements_text(policy_inner."fallbacks") WITH ORDINALITY AS fallback_items("model_id", ordinality)
        JOIN "provider_model" model ON model."model_id" = fallback_items."model_id"::integer
        GROUP BY policy_inner."policy_id"
      ) mapped
      WHERE policy."policy_id" = mapped."policy_id";
    `);

    await queryRunner.query(`ALTER TABLE "routing_policy" DROP COLUMN "primary_model_id";`);
    await queryRunner.query(`ALTER TABLE "routing_policy" RENAME COLUMN "primary_model_id_legacy" TO "primary_model_id";`);
    await queryRunner.query(`ALTER TABLE "routing_policy" DROP COLUMN "fallbacks";`);
    await queryRunner.query(`ALTER TABLE "routing_policy" RENAME COLUMN "fallbacks_legacy" TO "fallbacks";`);

    await queryRunner.query(`ALTER TABLE "provider_model" DROP CONSTRAINT IF EXISTS "uq_provider_model_provider_model";`);
    await queryRunner.query(`ALTER TABLE "provider_model" DROP CONSTRAINT IF EXISTS "provider_model_pkey";`);
    await queryRunner.query(`ALTER TABLE "provider_model" DROP COLUMN "model_id";`);
    await queryRunner.query(`ALTER TABLE "provider_model" RENAME COLUMN "legacy_model_id" TO "model_id";`);
    await queryRunner.query(`ALTER TABLE "provider_model" ADD CONSTRAINT "provider_model_pkey" PRIMARY KEY ("model_id");`);
    await queryRunner.query(`ALTER TABLE "provider_model" DROP COLUMN "model";`);

    await queryRunner.query(`
      ALTER TABLE "routing_policy"
      ADD CONSTRAINT "routing_policy_primary_model_id_fkey"
      FOREIGN KEY ("primary_model_id") REFERENCES "provider_model"("model_id") ON DELETE RESTRICT;
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_routing_policy_primary_model_id" ON "routing_policy" ("primary_model_id");`);
  }
}
