import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * The runtime model switch endpoint always persists its selection against this
 * profile. Older installations created the model_profile table without adding
 * this required default record.
 */
export class AddDefaultChatProfile20260729000200 implements MigrationInterface {
  name = 'AddDefaultChatProfile20260729000200';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "model_profile" ("profile_id", "display_name", "intent_tags", "status")
      VALUES ('chat-default', 'Default Chat', '[]'::jsonb, 'active')
      ON CONFLICT ("profile_id") DO NOTHING;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "model_profile"
      WHERE "profile_id" = 'chat-default'
        AND NOT EXISTS (
          SELECT 1
          FROM "routing_policy"
          WHERE "routing_policy"."profile_id" = 'chat-default'
        );
    `);
  }
}
