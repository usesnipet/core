import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1764581459694 implements MigrationInterface {
    name = 'Initial1764581459694'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."connector_states_status_enum" AS ENUM('HEALTHY', 'WARNING', 'ERROR', 'OFFLINE')`);
        await queryRunner.query(`CREATE TABLE "connector_states" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "connector_id" uuid NOT NULL, "last_heartbeat_at" TIMESTAMP WITH TIME ZONE NOT NULL, "last_sync_at" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."connector_states_status_enum" NOT NULL DEFAULT 'OFFLINE', "error_count" integer NOT NULL DEFAULT '0', "last_error_message" text, "last_error_details" json, "throttle_status" jsonb, "metrics" jsonb, "syncCursor" text, CONSTRAINT "REL_f625ce140f7fcfeb209db54af2" UNIQUE ("connector_id"), CONSTRAINT "PK_0aa0b7e97f9ebc3e1c26f3bae09" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."integrations_type_enum" AS ENUM('MANUAL', 'MCP')`);
        await queryRunner.query(`CREATE TABLE "integrations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "type" "public"."integrations_type_enum" NOT NULL, "auth_methods" jsonb NOT NULL, "manifest" jsonb NOT NULL, CONSTRAINT "PK_9adcdc6d6f3922535361ce641e8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."role_connector_permissions_policymode_enum" AS ENUM('ALLOWLIST', 'DENYLIST')`);
        await queryRunner.query(`CREATE TABLE "role_connector_permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "connector_id" uuid NOT NULL, "role_assignment_id" uuid NOT NULL, "policyMode" "public"."role_connector_permissions_policymode_enum" NOT NULL, "tools" jsonb, "resources" jsonb, "webhookEvents" jsonb, "manifestSnapshot" jsonb, "manifestVersion" character varying, CONSTRAINT "PK_5087d8bc9d09ad5cc55258e3219" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."connectors_type_enum" AS ENUM('MANUAL', 'MCP')`);
        await queryRunner.query(`CREATE TABLE "connectors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "knowledge_base_id" uuid NOT NULL, "integration_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "type" "public"."connectors_type_enum" NOT NULL, "capabilities" jsonb NOT NULL, "auth" jsonb NOT NULL, "config" jsonb NOT NULL, "connectorStateId" uuid, CONSTRAINT "PK_c1334e2a68a8de86d1732a8e3fb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "knowledge_bases" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, CONSTRAINT "PK_b7da0ee578e15ebb6213465440d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role_assignments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "role_id" uuid NOT NULL, "kb_permissions" jsonb NOT NULL, "knowledge_base_id" uuid NOT NULL, CONSTRAINT "PK_fc2df9835ac1d2a34839f113783" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "connector_states" ADD CONSTRAINT "FK_f625ce140f7fcfeb209db54af29" FOREIGN KEY ("connector_id") REFERENCES "connectors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_connector_permissions" ADD CONSTRAINT "FK_d5aa2dfa3b9483ee1944e146e41" FOREIGN KEY ("role_assignment_id") REFERENCES "role_assignments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_connector_permissions" ADD CONSTRAINT "FK_eff093c304a0d1b978a2149a33f" FOREIGN KEY ("connector_id") REFERENCES "connectors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "connectors" ADD CONSTRAINT "FK_01805d4ebf65235eb38d800c157" FOREIGN KEY ("integration_id") REFERENCES "integrations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "connectors" ADD CONSTRAINT "FK_4999d8f12c82e8b9aba6e372a11" FOREIGN KEY ("knowledge_base_id") REFERENCES "knowledge_bases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "connectors" ADD CONSTRAINT "FK_2ebb9f19a4b17dc18e10af48079" FOREIGN KEY ("connectorStateId") REFERENCES "connector_states"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_assignments" ADD CONSTRAINT "FK_a0268fc16c3777758f7683a4401" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_assignments" ADD CONSTRAINT "FK_dca78a9d7c26746d3b1032bf5e2" FOREIGN KEY ("knowledge_base_id") REFERENCES "knowledge_bases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_assignments" DROP CONSTRAINT "FK_dca78a9d7c26746d3b1032bf5e2"`);
        await queryRunner.query(`ALTER TABLE "role_assignments" DROP CONSTRAINT "FK_a0268fc16c3777758f7683a4401"`);
        await queryRunner.query(`ALTER TABLE "connectors" DROP CONSTRAINT "FK_2ebb9f19a4b17dc18e10af48079"`);
        await queryRunner.query(`ALTER TABLE "connectors" DROP CONSTRAINT "FK_4999d8f12c82e8b9aba6e372a11"`);
        await queryRunner.query(`ALTER TABLE "connectors" DROP CONSTRAINT "FK_01805d4ebf65235eb38d800c157"`);
        await queryRunner.query(`ALTER TABLE "role_connector_permissions" DROP CONSTRAINT "FK_eff093c304a0d1b978a2149a33f"`);
        await queryRunner.query(`ALTER TABLE "role_connector_permissions" DROP CONSTRAINT "FK_d5aa2dfa3b9483ee1944e146e41"`);
        await queryRunner.query(`ALTER TABLE "connector_states" DROP CONSTRAINT "FK_f625ce140f7fcfeb209db54af29"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "role_assignments"`);
        await queryRunner.query(`DROP TABLE "knowledge_bases"`);
        await queryRunner.query(`DROP TABLE "connectors"`);
        await queryRunner.query(`DROP TYPE "public"."connectors_type_enum"`);
        await queryRunner.query(`DROP TABLE "role_connector_permissions"`);
        await queryRunner.query(`DROP TYPE "public"."role_connector_permissions_policymode_enum"`);
        await queryRunner.query(`DROP TABLE "integrations"`);
        await queryRunner.query(`DROP TYPE "public"."integrations_type_enum"`);
        await queryRunner.query(`DROP TABLE "connector_states"`);
        await queryRunner.query(`DROP TYPE "public"."connector_states_status_enum"`);
    }

}
