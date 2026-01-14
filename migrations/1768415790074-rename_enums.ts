import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameEnums1768415790074 implements MigrationInterface {
    name = 'RenameEnums1768415790074'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_04b55df449f3f56fb1bcefe494"`);
        await queryRunner.query(`ALTER TYPE "public"."assets_type_enum" RENAME TO "assets_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."assets_type_enum" AS ENUM('FILE', 'TEXT', 'USER_INPUT', 'AI_RESPONSE', 'CONTEXT', 'ACTION')`);
        await queryRunner.query(`ALTER TABLE "assets" ALTER COLUMN "type" TYPE "public"."assets_type_enum" USING "type"::"text"::"public"."assets_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."assets_type_enum_old"`);
        await queryRunner.query(`CREATE INDEX "IDX_04b55df449f3f56fb1bcefe494" ON "assets" ("domain", "type") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_04b55df449f3f56fb1bcefe494"`);
        await queryRunner.query(`CREATE TYPE "public"."assets_type_enum_old" AS ENUM('FILE', 'TEXT', 'USER_QUESTION', 'AI_RESPONSE', 'CONTEXT', 'ACTION')`);
        await queryRunner.query(`ALTER TABLE "assets" ALTER COLUMN "type" TYPE "public"."assets_type_enum_old" USING "type"::"text"::"public"."assets_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."assets_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."assets_type_enum_old" RENAME TO "assets_type_enum"`);
        await queryRunner.query(`CREATE INDEX "IDX_04b55df449f3f56fb1bcefe494" ON "assets" ("domain", "type") `);
    }

}
