/**
 * @file This file configures and exports the main data source for the application using TypeORM.
 */

import path from "path";
import { DataSource } from "typeorm";

import { env } from "./env";
import { __root } from "./root";

/**
 * The main application {@link DataSource} for TypeORM.
 *
 * It is configured to connect to a PostgreSQL database using the `DATABASE_URL` from the environment variables.
 * - **Entities**: It automatically loads all files ending with `.entity.ts` from any `entities` subdirectory within the project.
 * - **Migrations**: It loads all migration files (`.ts` or `.js`) from the `migrations` directory in the project root.
 */
export const AppDataSource = new DataSource({
  type: "postgres",
  url: env.DATABASE_URL,
  entities: [ path.join(__root, "**/entities/*.entity.ts") ],
  migrations: [ path.join(__root, "migrations/*.{ts,js}") ]
});
