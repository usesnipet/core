import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAssets1768126154766 implements MigrationInterface {
    name = 'AddAssets1768126154766'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."assets_domain_enum" AS ENUM('SNIPET', 'KNOWLEDGE')`);
        await queryRunner.query(`CREATE TYPE "public"."assets_type_enum" AS ENUM('FILE', 'TEXT', 'USER_QUESTION', 'AI_RESPONSE', 'PROMPT', 'CHUNK', 'SEARCH_QUERY', 'SEARCH_RESULT', 'EMBEDDING', 'TOOL_INPUT', 'TOOL_OUTPUT', 'FEEDBACK')`);
        await queryRunner.query(`CREATE TYPE "public"."assets_source_enum" AS ENUM('USER', 'AI', 'SYSTEM', 'INTEGRATION')`);
        await queryRunner.query(`CREATE TYPE "public"."assets_lifecycle_enum" AS ENUM('EPHEMERAL', 'PERSISTENT', 'ARCHIVED', 'DELETED')`);
        await queryRunner.query(`CREATE TABLE "assets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "domain" "public"."assets_domain_enum" NOT NULL, "type" "public"."assets_type_enum" NOT NULL, "source" "public"."assets_source_enum" NOT NULL, "lifecycle" "public"."assets_lifecycle_enum" NOT NULL, "knowledge_id" uuid NOT NULL, "snipet_id" uuid, "created_by_id" uuid, "metadata" jsonb, "deletedAt" TIMESTAMP, "contentHash" character varying, "contentSizebytes" bigint, "contentMimetype" character varying, "contentLanguage" character varying, "contentTokensestimate" integer, "storageProvider" character varying, "storageKey" character varying, "storagePersisted" boolean NOT NULL DEFAULT false, "modelName" character varying, "modelVersion" character varying, "modelCost" double precision, CONSTRAINT "PK_da96729a8b113377cfb6a62439c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_04b55df449f3f56fb1bcefe494" ON "assets" ("domain", "type") `);
        await queryRunner.query(`ALTER TABLE "assets" ADD CONSTRAINT "FK_74884298902ed86deaf57b1bef0" FOREIGN KEY ("knowledge_id") REFERENCES "knowledge_bases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "assets" ADD CONSTRAINT "FK_f2fd20fe848460c224d4012662e" FOREIGN KEY ("snipet_id") REFERENCES "snipets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "assets" ADD CONSTRAINT "FK_ab08d6c2ace44e63a55da44b9a7" FOREIGN KEY ("created_by_id") REFERENCES "api_keys"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "snipets" ADD CONSTRAINT "FK_4f5b7176f1836dafbac9492379c" FOREIGN KEY ("knowledge_id") REFERENCES "knowledge_bases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "snipets" DROP CONSTRAINT "FK_4f5b7176f1836dafbac9492379c"`);
        await queryRunner.query(`ALTER TABLE "assets" DROP CONSTRAINT "FK_ab08d6c2ace44e63a55da44b9a7"`);
        await queryRunner.query(`ALTER TABLE "assets" DROP CONSTRAINT "FK_f2fd20fe848460c224d4012662e"`);
        await queryRunner.query(`ALTER TABLE "assets" DROP CONSTRAINT "FK_74884298902ed86deaf57b1bef0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_04b55df449f3f56fb1bcefe494"`);
        await queryRunner.query(`DROP TABLE "assets"`);
        await queryRunner.query(`DROP TYPE "public"."assets_lifecycle_enum"`);
        await queryRunner.query(`DROP TYPE "public"."assets_source_enum"`);
        await queryRunner.query(`DROP TYPE "public"."assets_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."assets_domain_enum"`);
    }

}
