import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameRoleToApiKey1765990154942 implements MigrationInterface {
    name = 'RenameRoleToApiKey1765990154942'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "api_keys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "keyHash" character varying(64) NOT NULL, "name" character varying(255) NOT NULL, "rateLimit" integer, "revoked" boolean NOT NULL DEFAULT false, "expiresAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_5c8a79801b44bd27b79228e1dad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_df3b25181df0b4b59bd93f16e1" ON "api_keys" ("keyHash") `);
        await queryRunner.query(`CREATE TYPE "public"."api_key_assignments_kb_permissions_enum" AS ENUM('1', '2', '4')`);
        await queryRunner.query(`CREATE TABLE "api_key_assignments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "api_key_id" uuid NOT NULL, "kb_permissions" "public"."api_key_assignments_kb_permissions_enum" NOT NULL, "knowledge_base_id" uuid NOT NULL, CONSTRAINT "PK_f4e80ab8d6ad39bfad4c30fc008" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."api_key_connector_permissions_policymode_enum" AS ENUM('ALLOWLIST', 'DENYLIST')`);
        await queryRunner.query(`CREATE TABLE "api_key_connector_permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "connector_id" uuid NOT NULL, "api_key_assignment_id" uuid NOT NULL, "policyMode" "public"."api_key_connector_permissions_policymode_enum" NOT NULL, "tools" jsonb, "resources" jsonb, "webhookEvents" jsonb, "manifestSnapshot" jsonb, "manifestVersion" character varying, CONSTRAINT "PK_88e03b4d3048c93d1cfb5d6e869" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "integrations" ALTER COLUMN "name" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "api_key_assignments" ADD CONSTRAINT "FK_c738ddc1ced2fcd69b8686d14a7" FOREIGN KEY ("api_key_id") REFERENCES "api_keys"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "api_key_assignments" ADD CONSTRAINT "FK_ac56dd0e8a241e594599b718e9f" FOREIGN KEY ("knowledge_base_id") REFERENCES "knowledge_bases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "api_key_connector_permissions" ADD CONSTRAINT "FK_a005fd49d0b6c2e03d417d573f3" FOREIGN KEY ("api_key_assignment_id") REFERENCES "api_key_assignments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "api_key_connector_permissions" ADD CONSTRAINT "FK_39219a0c01605e09d6046c10e5b" FOREIGN KEY ("connector_id") REFERENCES "connectors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "api_key_connector_permissions" DROP CONSTRAINT "FK_39219a0c01605e09d6046c10e5b"`);
        await queryRunner.query(`ALTER TABLE "api_key_connector_permissions" DROP CONSTRAINT "FK_a005fd49d0b6c2e03d417d573f3"`);
        await queryRunner.query(`ALTER TABLE "api_key_assignments" DROP CONSTRAINT "FK_ac56dd0e8a241e594599b718e9f"`);
        await queryRunner.query(`ALTER TABLE "api_key_assignments" DROP CONSTRAINT "FK_c738ddc1ced2fcd69b8686d14a7"`);
        await queryRunner.query(`ALTER TABLE "integrations" ALTER COLUMN "name" SET DEFAULT ''`);
        await queryRunner.query(`DROP TABLE "api_key_connector_permissions"`);
        await queryRunner.query(`DROP TYPE "public"."api_key_connector_permissions_policymode_enum"`);
        await queryRunner.query(`DROP TABLE "api_key_assignments"`);
        await queryRunner.query(`DROP TYPE "public"."api_key_assignments_kb_permissions_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_df3b25181df0b4b59bd93f16e1"`);
        await queryRunner.query(`DROP TABLE "api_keys"`);
    }

}
