import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSession1764694584065 implements MigrationInterface {
    name = 'AddSession1764694584065'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "session_contexts" ("session_id" uuid NOT NULL, "state" character varying, "lastRun" jsonb, CONSTRAINT "session_id" UNIQUE ("session_id"), CONSTRAINT "PK_4027c6232cda7cc7a84db2a5d49" PRIMARY KEY ("session_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."session_messages_role_enum" AS ENUM('USER', 'ASSISTANT', 'SYSTEM', 'FUNCTION')`);
        await queryRunner.query(`CREATE TABLE "session_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "session_id" uuid NOT NULL, "content" text NOT NULL, "role" "public"."session_messages_role_enum" NOT NULL, CONSTRAINT "PK_25b3c73b5dd210b40ce5c02ce20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."sessions_type_enum" AS ENUM('CHAT')`);
        await queryRunner.query(`CREATE TABLE "sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying, "type" "public"."sessions_type_enum" NOT NULL DEFAULT 'CHAT', "metadata" jsonb, "knowledge_id" uuid NOT NULL, CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "session_name" ON "sessions" ("name") `);
        await queryRunner.query(`ALTER TABLE "session_contexts" ADD CONSTRAINT "FK_4027c6232cda7cc7a84db2a5d49" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "session_messages" ADD CONSTRAINT "FK_5c76ae848db745693cebc00aed5" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session_messages" DROP CONSTRAINT "FK_5c76ae848db745693cebc00aed5"`);
        await queryRunner.query(`ALTER TABLE "session_contexts" DROP CONSTRAINT "FK_4027c6232cda7cc7a84db2a5d49"`);
        await queryRunner.query(`DROP INDEX "public"."session_name"`);
        await queryRunner.query(`DROP TABLE "sessions"`);
        await queryRunner.query(`DROP TYPE "public"."sessions_type_enum"`);
        await queryRunner.query(`DROP TABLE "session_messages"`);
        await queryRunner.query(`DROP TYPE "public"."session_messages_role_enum"`);
        await queryRunner.query(`DROP TABLE "session_contexts"`);
    }

}
