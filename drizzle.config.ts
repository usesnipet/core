import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { resolve } from "node:path";

// drizzle-kit does not load Nest's env bootstrap; mirror common monorepo layout.
loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), "../../.env"), override: true });
loadEnv({ path: resolve(process.cwd(), "../../.env.local"), override: true });

export default defineConfig({
  schema: "./src/db/schema",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/postgres",
  },
});
