ALTER TABLE "api_key" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "flow" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();