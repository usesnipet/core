import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNamespaceToKnowledge1764666913565 implements MigrationInterface {
    name = 'AddNamespaceToKnowledge1764666913565'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "knowledge_bases" ADD "namespace" character varying(255)`);
        await queryRunner.query(`CREATE INDEX "knowledge_base_namespace_unique" ON "knowledge_bases" ("namespace") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."knowledge_base_namespace_unique"`);
        await queryRunner.query(`ALTER TABLE "knowledge_bases" DROP COLUMN "namespace"`);
    }

}
