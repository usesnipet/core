import { MigrationInterface, QueryRunner } from "typeorm";

export class Add1768408795809 implements MigrationInterface {
    name = 'Add1768408795809'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."executions_state_enum" AS ENUM('pending', 'running', 'finished', 'error')`);
        await queryRunner.query(`CREATE TABLE "executions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "knowledge_id" uuid NOT NULL, "snipet_id" uuid NOT NULL, "options" jsonb NOT NULL, "result" jsonb, "state" "public"."executions_state_enum" NOT NULL DEFAULT 'pending', CONSTRAINT "PK_703e64e0ef651986191844b7b8b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "lifecycle"`);
        await queryRunner.query(`DROP TYPE "public"."assets_lifecycle_enum"`);
        await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "contentTokensestimate"`);
        await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "modelCost"`);
        await queryRunner.query(`ALTER TABLE "assets" ADD "execution_id" uuid`);
        await queryRunner.query(`ALTER TABLE "assets" ADD "contentText" character varying`);
        await queryRunner.query(`DROP INDEX "public"."IDX_04b55df449f3f56fb1bcefe494"`);
        await queryRunner.query(`ALTER TYPE "public"."assets_type_enum" RENAME TO "assets_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."assets_type_enum" AS ENUM('FILE', 'TEXT', 'USER_QUESTION', 'AI_RESPONSE', 'CONTEXT', 'ACTION')`);
        await queryRunner.query(`ALTER TABLE "assets" ALTER COLUMN "type" TYPE "public"."assets_type_enum" USING "type"::"text"::"public"."assets_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."assets_type_enum_old"`);
        await queryRunner.query(`CREATE INDEX "IDX_04b55df449f3f56fb1bcefe494" ON "assets" ("domain", "type") `);
        await queryRunner.query(`ALTER TABLE "executions" ADD CONSTRAINT "FK_17e0347e32ff79994dc82a479c9" FOREIGN KEY ("knowledge_id") REFERENCES "knowledge_bases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "executions" ADD CONSTRAINT "FK_ad66dce9522a3b5360276a908ca" FOREIGN KEY ("snipet_id") REFERENCES "snipets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "assets" ADD CONSTRAINT "FK_ac8614574f8e18245f0daa9e7dd" FOREIGN KEY ("execution_id") REFERENCES "executions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assets" DROP CONSTRAINT "FK_ac8614574f8e18245f0daa9e7dd"`);
        await queryRunner.query(`ALTER TABLE "executions" DROP CONSTRAINT "FK_ad66dce9522a3b5360276a908ca"`);
        await queryRunner.query(`ALTER TABLE "executions" DROP CONSTRAINT "FK_17e0347e32ff79994dc82a479c9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_04b55df449f3f56fb1bcefe494"`);
        await queryRunner.query(`CREATE TYPE "public"."assets_type_enum_old" AS ENUM('FILE', 'TEXT', 'USER_QUESTION', 'AI_RESPONSE', 'PROMPT', 'CHUNK', 'SEARCH_QUERY', 'SEARCH_RESULT', 'EMBEDDING', 'TOOL_INPUT', 'TOOL_OUTPUT', 'FEEDBACK')`);
        await queryRunner.query(`ALTER TABLE "assets" ALTER COLUMN "type" TYPE "public"."assets_type_enum_old" USING "type"::"text"::"public"."assets_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."assets_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."assets_type_enum_old" RENAME TO "assets_type_enum"`);
        await queryRunner.query(`CREATE INDEX "IDX_04b55df449f3f56fb1bcefe494" ON "assets" ("domain", "type") `);
        await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "contentText"`);
        await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "execution_id"`);
        await queryRunner.query(`ALTER TABLE "assets" ADD "modelCost" double precision`);
        await queryRunner.query(`ALTER TABLE "assets" ADD "contentTokensestimate" integer`);
        await queryRunner.query(`CREATE TYPE "public"."assets_lifecycle_enum" AS ENUM('EPHEMERAL', 'PERSISTENT', 'ARCHIVED', 'DELETED')`);
        await queryRunner.query(`ALTER TABLE "assets" ADD "lifecycle" "public"."assets_lifecycle_enum" NOT NULL`);
        await queryRunner.query(`DROP TABLE "executions"`);
        await queryRunner.query(`DROP TYPE "public"."executions_state_enum"`);
    }

}
