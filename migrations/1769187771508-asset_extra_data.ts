import { MigrationInterface, QueryRunner } from "typeorm";

export class AssetExtraData1769187771508 implements MigrationInterface {
    name = 'AssetExtraData1769187771508'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "metrics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "modelModel" character varying(255), "modelOperationtype" character varying(255) NOT NULL, "modelTokens" integer NOT NULL, "modelEstimatecost" integer NOT NULL, CONSTRAINT "PK_5283cad666a83376e28a715bf0e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "storageKey"`);
        await queryRunner.query(`ALTER TABLE "assets" ADD "extra_data" jsonb`);
        await queryRunner.query(`ALTER TABLE "assets" ADD "storagePath" character varying`);
        await queryRunner.query(`DROP INDEX "public"."IDX_04b55df449f3f56fb1bcefe494"`);
        await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."assets_type_enum"`);
        await queryRunner.query(`ALTER TABLE "assets" ADD "type" character varying NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_04b55df449f3f56fb1bcefe494" ON "assets" ("domain", "type") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_04b55df449f3f56fb1bcefe494"`);
        await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "type"`);
        await queryRunner.query(`CREATE TYPE "public"."assets_type_enum" AS ENUM('FILE', 'TEXT', 'USER_INPUT', 'AI_RESPONSE', 'CONTEXT', 'ACTION')`);
        await queryRunner.query(`ALTER TABLE "assets" ADD "type" "public"."assets_type_enum" NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_04b55df449f3f56fb1bcefe494" ON "assets" ("domain", "type") `);
        await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "storagePath"`);
        await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "extra_data"`);
        await queryRunner.query(`ALTER TABLE "assets" ADD "storageKey" character varying`);
        await queryRunner.query(`DROP TABLE "metrics"`);
    }

}
