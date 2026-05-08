CREATE TABLE "api_key" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"key_hash" text NOT NULL,
	"last_used_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"revoked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"config_id" varchar(512) NOT NULL,
	"package_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"docs" text,
	"icon" text,
	"author" text,
	"field_schema" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "config_config_id_unique" UNIQUE("config_id")
);
--> statement-breakpoint
CREATE TABLE "config_tag" (
	"config_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "config_tag_config_id_tag_id_pk" PRIMARY KEY("config_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "node_tag" (
	"node_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "node_tag_node_id_tag_id_pk" PRIMARY KEY("node_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "node_type_tag" (
	"node_type_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "node_type_tag_node_type_id_tag_id_pk" PRIMARY KEY("node_type_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "package_tag" (
	"package_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "package_tag_package_id_tag_id_pk" PRIMARY KEY("package_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "flow" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"code" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "node_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type_id" varchar(512) NOT NULL,
	"package_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"docs" text,
	"icon" text,
	"author" text,
	"inputs" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"outputs" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"components" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "node_type_type_id_unique" UNIQUE("type_id")
);
--> statement-breakpoint
CREATE TABLE "node" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"node_id" varchar(512) NOT NULL,
	"package_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"docs" text,
	"icon" text,
	"author" text,
	"node_type_id" uuid NOT NULL,
	"config_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "node_node_id_unique" UNIQUE("node_id")
);
--> statement-breakpoint
CREATE TABLE "package" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"docs" text,
	"icon" text,
	"author" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "tag_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "config" ADD CONSTRAINT "config_package_id_package_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."package"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "config_tag" ADD CONSTRAINT "config_tag_config_id_config_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."config"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "config_tag" ADD CONSTRAINT "config_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node_tag" ADD CONSTRAINT "node_tag_node_id_node_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."node"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node_tag" ADD CONSTRAINT "node_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node_type_tag" ADD CONSTRAINT "node_type_tag_node_type_id_node_type_id_fk" FOREIGN KEY ("node_type_id") REFERENCES "public"."node_type"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node_type_tag" ADD CONSTRAINT "node_type_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_tag" ADD CONSTRAINT "package_tag_package_id_package_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."package"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_tag" ADD CONSTRAINT "package_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node_type" ADD CONSTRAINT "node_type_package_id_package_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."package"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node" ADD CONSTRAINT "node_package_id_package_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."package"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node" ADD CONSTRAINT "node_node_type_id_node_type_id_fk" FOREIGN KEY ("node_type_id") REFERENCES "public"."node_type"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node" ADD CONSTRAINT "node_config_id_config_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."config"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "config_package_id_idx" ON "config" USING btree ("package_id");--> statement-breakpoint
CREATE INDEX "node_type_package_id_idx" ON "node_type" USING btree ("package_id");--> statement-breakpoint
CREATE INDEX "node_package_id_idx" ON "node" USING btree ("package_id");--> statement-breakpoint
CREATE INDEX "node_node_type_id_idx" ON "node" USING btree ("node_type_id");--> statement-breakpoint
CREATE INDEX "node_config_id_idx" ON "node" USING btree ("config_id");