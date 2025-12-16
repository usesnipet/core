import { MigrationInterface, QueryRunner } from "typeorm";

export class RoleWithKey1765913853230 implements MigrationInterface {
    name = 'RoleWithKey1765913853230'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "integrations" ADD "name" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "keyHash" character varying(64) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "rateLimit" integer`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "revoked" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "expiresAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "role_assignments" DROP COLUMN "kb_permissions"`);
        await queryRunner.query(`CREATE TYPE "public"."role_assignments_kb_permissions_enum" AS ENUM('1', '2', '4')`);
        await queryRunner.query(`ALTER TABLE "role_assignments" ADD "kb_permissions" "public"."role_assignments_kb_permissions_enum" NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e9e36611038386219da7d5ed00" ON "roles" ("keyHash") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_e9e36611038386219da7d5ed00"`);
        await queryRunner.query(`ALTER TABLE "role_assignments" DROP COLUMN "kb_permissions"`);
        await queryRunner.query(`DROP TYPE "public"."role_assignments_kb_permissions_enum"`);
        await queryRunner.query(`ALTER TABLE "role_assignments" ADD "kb_permissions" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "expiresAt"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "revoked"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "rateLimit"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "keyHash"`);
        await queryRunner.query(`ALTER TABLE "integrations" DROP COLUMN "name"`);
    }

}
