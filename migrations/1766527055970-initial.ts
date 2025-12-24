import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1766527055970 implements MigrationInterface {
    name = 'Initial1766527055970'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."connector_states_status_enum" AS ENUM('HEALTHY', 'WARNING', 'ERROR', 'OFFLINE')`);
        await queryRunner.query(`CREATE TABLE "connector_states" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "connector_id" uuid NOT NULL, "last_heartbeat_at" TIMESTAMP WITH TIME ZONE NOT NULL, "last_sync_at" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."connector_states_status_enum" NOT NULL DEFAULT 'OFFLINE', "error_count" integer NOT NULL DEFAULT '0', "last_error_message" text, "last_error_details" json, "throttle_status" jsonb, "metrics" jsonb, "syncCursor" text, CONSTRAINT "REL_f625ce140f7fcfeb209db54af2" UNIQUE ("connector_id"), CONSTRAINT "PK_0aa0b7e97f9ebc3e1c26f3bae09" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."integrations_type_enum" AS ENUM('MANUAL', 'MCP')`);
        await queryRunner.query(`CREATE TABLE "integrations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "type" "public"."integrations_type_enum" NOT NULL, "auth_methods" jsonb NOT NULL, "manifest" jsonb NOT NULL, CONSTRAINT "PK_9adcdc6d6f3922535361ce641e8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "api_keys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "keyHash" character varying(64) NOT NULL, "root" boolean NOT NULL DEFAULT false, "name" character varying(255) NOT NULL, "permissions" integer NOT NULL DEFAULT '0', "rateLimit" integer, "revoked" boolean NOT NULL DEFAULT false, "expiresAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_5c8a79801b44bd27b79228e1dad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_df3b25181df0b4b59bd93f16e1" ON "api_keys" ("keyHash") `);
        await queryRunner.query(`CREATE TYPE "public"."api_key_assignments_kb_permissions_enum" AS ENUM('1', '2', '4')`);
        await queryRunner.query(`CREATE TABLE "api_key_assignments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "api_key_id" uuid NOT NULL, "kb_permissions" "public"."api_key_assignments_kb_permissions_enum" NOT NULL, "knowledge_base_id" uuid NOT NULL, CONSTRAINT "PK_f4e80ab8d6ad39bfad4c30fc008" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."api_key_connector_permissions_policymode_enum" AS ENUM('ALLOWLIST', 'DENYLIST')`);
        await queryRunner.query(`CREATE TABLE "api_key_connector_permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "connector_id" uuid NOT NULL, "api_key_assignment_id" uuid NOT NULL, "policyMode" "public"."api_key_connector_permissions_policymode_enum" NOT NULL, "tools" jsonb, "resources" jsonb, "webhookEvents" jsonb, "manifestSnapshot" jsonb, "manifestVersion" character varying, CONSTRAINT "PK_88e03b4d3048c93d1cfb5d6e869" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."connectors_type_enum" AS ENUM('MANUAL', 'MCP')`);
        await queryRunner.query(`CREATE TABLE "connectors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "knowledge_base_id" uuid NOT NULL, "integration_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "type" "public"."connectors_type_enum" NOT NULL, "capabilities" jsonb NOT NULL, "auth" jsonb NOT NULL, "config" jsonb NOT NULL, "connectorStateId" uuid, CONSTRAINT "PK_c1334e2a68a8de86d1732a8e3fb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "knowledge_bases" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "namespace" character varying(255), CONSTRAINT "PK_b7da0ee578e15ebb6213465440d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "knowledge_base_namespace_unique" ON "knowledge_bases" ("namespace") `);
        await queryRunner.query(`CREATE TYPE "public"."snipet_messages_role_enum" AS ENUM('USER', 'ASSISTANT', 'SYSTEM', 'FUNCTION')`);
        await queryRunner.query(`CREATE TABLE "snipet_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "snipet_id" uuid NOT NULL, "knowledge_id" uuid NOT NULL, "content" text NOT NULL, "role" "public"."snipet_messages_role_enum" NOT NULL, CONSTRAINT "PK_28f3ff44522411ea065be9cf016" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."snipets_type_enum" AS ENUM('CHAT')`);
        await queryRunner.query(`CREATE TABLE "snipets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying, "type" "public"."snipets_type_enum" NOT NULL DEFAULT 'CHAT', "metadata" jsonb, "knowledge_id" uuid NOT NULL, CONSTRAINT "PK_f786b585fd1262597351099add2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "snipet_name" ON "snipets" ("name") `);
        await queryRunner.query(`ALTER TABLE "connector_states" ADD CONSTRAINT "FK_f625ce140f7fcfeb209db54af29" FOREIGN KEY ("connector_id") REFERENCES "connectors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "api_key_assignments" ADD CONSTRAINT "FK_c738ddc1ced2fcd69b8686d14a7" FOREIGN KEY ("api_key_id") REFERENCES "api_keys"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "api_key_assignments" ADD CONSTRAINT "FK_ac56dd0e8a241e594599b718e9f" FOREIGN KEY ("knowledge_base_id") REFERENCES "knowledge_bases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "api_key_connector_permissions" ADD CONSTRAINT "FK_a005fd49d0b6c2e03d417d573f3" FOREIGN KEY ("api_key_assignment_id") REFERENCES "api_key_assignments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "api_key_connector_permissions" ADD CONSTRAINT "FK_39219a0c01605e09d6046c10e5b" FOREIGN KEY ("connector_id") REFERENCES "connectors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "connectors" ADD CONSTRAINT "FK_01805d4ebf65235eb38d800c157" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "connectors" ADD CONSTRAINT "FK_4999d8f12c82e8b9aba6e372a11" FOREIGN KEY ("knowledge_base_id") REFERENCES "knowledge_bases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "connectors" ADD CONSTRAINT "FK_2ebb9f19a4b17dc18e10af48079" FOREIGN KEY ("connectorStateId") REFERENCES "connector_states"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "snipet_messages" ADD CONSTRAINT "FK_7db7bd6374eb12f183d6620907a" FOREIGN KEY ("snipet_id") REFERENCES "snipets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "snipet_messages" ADD CONSTRAINT "FK_73bb8e9f81527d7cba35d435e4f" FOREIGN KEY ("knowledge_id") REFERENCES "knowledge_bases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "snipet_messages" DROP CONSTRAINT "FK_73bb8e9f81527d7cba35d435e4f"`);
        await queryRunner.query(`ALTER TABLE "snipet_messages" DROP CONSTRAINT "FK_7db7bd6374eb12f183d6620907a"`);
        await queryRunner.query(`ALTER TABLE "connectors" DROP CONSTRAINT "FK_2ebb9f19a4b17dc18e10af48079"`);
        await queryRunner.query(`ALTER TABLE "connectors" DROP CONSTRAINT "FK_4999d8f12c82e8b9aba6e372a11"`);
        await queryRunner.query(`ALTER TABLE "connectors" DROP CONSTRAINT "FK_01805d4ebf65235eb38d800c157"`);
        await queryRunner.query(`ALTER TABLE "api_key_connector_permissions" DROP CONSTRAINT "FK_39219a0c01605e09d6046c10e5b"`);
        await queryRunner.query(`ALTER TABLE "api_key_connector_permissions" DROP CONSTRAINT "FK_a005fd49d0b6c2e03d417d573f3"`);
        await queryRunner.query(`ALTER TABLE "api_key_assignments" DROP CONSTRAINT "FK_ac56dd0e8a241e594599b718e9f"`);
        await queryRunner.query(`ALTER TABLE "api_key_assignments" DROP CONSTRAINT "FK_c738ddc1ced2fcd69b8686d14a7"`);
        await queryRunner.query(`ALTER TABLE "connector_states" DROP CONSTRAINT "FK_f625ce140f7fcfeb209db54af29"`);
        await queryRunner.query(`DROP INDEX "public"."snipet_name"`);
        await queryRunner.query(`DROP TABLE "snipets"`);
        await queryRunner.query(`DROP TYPE "public"."snipets_type_enum"`);
        await queryRunner.query(`DROP TABLE "snipet_messages"`);
        await queryRunner.query(`DROP TYPE "public"."snipet_messages_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."knowledge_base_namespace_unique"`);
        await queryRunner.query(`DROP TABLE "knowledge_bases"`);
        await queryRunner.query(`DROP TABLE "connectors"`);
        await queryRunner.query(`DROP TYPE "public"."connectors_type_enum"`);
        await queryRunner.query(`DROP TABLE "api_key_connector_permissions"`);
        await queryRunner.query(`DROP TYPE "public"."api_key_connector_permissions_policymode_enum"`);
        await queryRunner.query(`DROP TABLE "api_key_assignments"`);
        await queryRunner.query(`DROP TYPE "public"."api_key_assignments_kb_permissions_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_df3b25181df0b4b59bd93f16e1"`);
        await queryRunner.query(`DROP TABLE "api_keys"`);
        await queryRunner.query(`DROP TABLE "integrations"`);
        await queryRunner.query(`DROP TYPE "public"."integrations_type_enum"`);
        await queryRunner.query(`DROP TABLE "connector_states"`);
        await queryRunner.query(`DROP TYPE "public"."connector_states_status_enum"`);
    }

}
