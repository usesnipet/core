import { MigrationInterface, QueryRunner } from "typeorm";

export class SnipetMemory1767384118638 implements MigrationInterface {
    name = 'SnipetMemory1767384118638'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."snipet_memory_type_enum" AS ENUM('user_input', 'text_assistant_output')`);
        await queryRunner.query(`CREATE TYPE "public"."snipet_memory_intent_enum" AS ENUM('answer', 'summarize', 'expand')`);
        await queryRunner.query(`CREATE TABLE "snipet_memory" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "snipet_id" uuid NOT NULL, "knowledge_id" uuid NOT NULL, "type" "public"."snipet_memory_type_enum" NOT NULL, "intent" "public"."snipet_memory_intent_enum" NOT NULL, "payload" jsonb NOT NULL, CONSTRAINT "PK_bd790daefa46694f66c7c4d1136" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "snipets" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."snipets_type_enum"`);
        await queryRunner.query(`ALTER TABLE "snipet_memory" ADD CONSTRAINT "FK_31bcd666f0c5f19658cf2e8a92d" FOREIGN KEY ("knowledge_id") REFERENCES "knowledge_bases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "snipet_memory" ADD CONSTRAINT "FK_9ad4bd40a27e1a5dfcf3ff67f25" FOREIGN KEY ("snipet_id") REFERENCES "snipets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "snipet_memory" DROP CONSTRAINT "FK_9ad4bd40a27e1a5dfcf3ff67f25"`);
        await queryRunner.query(`ALTER TABLE "snipet_memory" DROP CONSTRAINT "FK_31bcd666f0c5f19658cf2e8a92d"`);
        await queryRunner.query(`CREATE TYPE "public"."snipets_type_enum" AS ENUM('CHAT')`);
        await queryRunner.query(`ALTER TABLE "snipets" ADD "type" "public"."snipets_type_enum" NOT NULL DEFAULT 'CHAT'`);
        await queryRunner.query(`DROP TABLE "snipet_memory"`);
        await queryRunner.query(`DROP TYPE "public"."snipet_memory_intent_enum"`);
        await queryRunner.query(`DROP TYPE "public"."snipet_memory_type_enum"`);
    }

}
