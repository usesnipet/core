import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPermissionToApiKey1765991088061 implements MigrationInterface {
    name = 'AddPermissionToApiKey1765991088061'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "api_keys" ADD "permissions" integer NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "api_keys" DROP COLUMN "permissions"`);
    }

}
