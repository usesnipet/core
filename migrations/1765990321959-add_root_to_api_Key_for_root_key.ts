import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRootToApiKeyForRootKey1765990321959 implements MigrationInterface {
    name = 'AddRootToApiKeyForRootKey1765990321959'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "api_keys" ADD "root" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "api_keys" DROP COLUMN "root"`);
    }

}
