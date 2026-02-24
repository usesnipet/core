/**
 * @file This file configures and exports the main data source for the application using TypeORM.
 */

import path from "path";
import { DataSource } from "typeorm";

import { env } from "./env";
import { __root } from "./root";

/** Resolves migrations path: uses dist/migrations in production (compiled), migrations in development. */
const getMigrationsPath = (): string[] => {
  const isProd = process.env.NODE_ENV === "production";
  if (isProd) {
    return [ path.join(__root, "dist/migrations/*.js") ];
  }
  return [ path.join(__root, "migrations/*.{ts,js}") ];
};

/**
 * The main application {@link DataSource} for TypeORM.
 *
 * It is configured to connect to a PostgreSQL database using the `DATABASE_URL` from the environment variables.
 * - **Entities**: It automatically loads all files ending with `.entity.ts` or `.entity.js` from any `entities` subdirectory.
 * - **Migrations**: It loads migration files from `dist/migrations` (production) or `migrations` (development).
 */
export const AppDataSource = new DataSource({
  type: "postgres",
  url: env.DATABASE_URL,
  entities: [
    path.join(__root, "**/entities/*.entity.ts"),
    path.join(__root, "**/entities/*.entity.js")
  ],
  migrations: getMigrationsPath()
});
