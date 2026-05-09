-- Add nullable first so existing rows do not violate NOT NULL; backfill then tighten.
ALTER TABLE "package" ADD COLUMN "package_id" varchar(512);--> statement-breakpoint
UPDATE "package" SET "package_id" = "id"::text WHERE "package_id" IS NULL;--> statement-breakpoint
ALTER TABLE "package" ALTER COLUMN "package_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "package" ADD CONSTRAINT "package_package_id_unique" UNIQUE("package_id");