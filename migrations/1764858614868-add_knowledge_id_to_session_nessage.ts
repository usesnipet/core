import { MigrationInterface, QueryRunner } from "typeorm";

export class AddKnowledgeIdToSessionNessage1764858614868 implements MigrationInterface {
    name = 'AddKnowledgeIdToSessionNessage1764858614868'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session_messages" DROP CONSTRAINT "FK_5c76ae848db745693cebc00aed5"`);
        await queryRunner.query(`ALTER TABLE "session_messages" ADD "knowledge_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session_contexts" DROP CONSTRAINT "FK_4027c6232cda7cc7a84db2a5d49"`);
        await queryRunner.query(`ALTER TABLE "session_contexts" ADD CONSTRAINT "UQ_4027c6232cda7cc7a84db2a5d49" UNIQUE ("session_id")`);
        await queryRunner.query(`ALTER TABLE "session_contexts" ADD CONSTRAINT "FK_4027c6232cda7cc7a84db2a5d49" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "session_messages" ADD CONSTRAINT "FK_5c76ae848db745693cebc00aed5" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "session_messages" ADD CONSTRAINT "FK_b530549e239d1a3eb3f133d4a67" FOREIGN KEY ("knowledge_id") REFERENCES "knowledge_bases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session_messages" DROP CONSTRAINT "FK_b530549e239d1a3eb3f133d4a67"`);
        await queryRunner.query(`ALTER TABLE "session_messages" DROP CONSTRAINT "FK_5c76ae848db745693cebc00aed5"`);
        await queryRunner.query(`ALTER TABLE "session_contexts" DROP CONSTRAINT "FK_4027c6232cda7cc7a84db2a5d49"`);
        await queryRunner.query(`ALTER TABLE "session_contexts" DROP CONSTRAINT "UQ_4027c6232cda7cc7a84db2a5d49"`);
        await queryRunner.query(`ALTER TABLE "session_contexts" ADD CONSTRAINT "FK_4027c6232cda7cc7a84db2a5d49" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "session_messages" DROP COLUMN "knowledge_id"`);
        await queryRunner.query(`ALTER TABLE "session_messages" ADD CONSTRAINT "FK_5c76ae848db745693cebc00aed5" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
