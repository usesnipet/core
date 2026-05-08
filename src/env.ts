/**
 * @file Manages environment variables for the application.
 *
 * This file uses `dotenv` to load environment variables from a `.env` file and `zod` to validate,
 * parse, and provide default values for them. This ensures that the application's configuration
 * is type-safe and has sensible defaults.
 */

import dotenv from "dotenv";
import z from "zod";

import { __root } from "./root";

const envFile = process.env.ENV_FILE;

/**
 * Determines the search paths for the `.env` file.
 * If an `ENV_FILE` environment variable is set, it prioritizes that file path.
 * Otherwise, it defaults to a standard search path (`.env`, `../../.env`, etc.).
 * @param envFile - Optional custom path for the environment file.
 * @returns An array of paths to search for the `.env` file.
 */
const buildEnvPaths = (envFile?: string): string[] => {
  if (envFile) {
    return [ envFile, `../../${envFile}` ];
  }
  return [ ".env", "../../.env", "../../.env.local" ];
};

// Load environment variables from the determined paths.
dotenv.config({
  path: buildEnvPaths(envFile)
});

const envSchema = z.object({
  // APP
  APP_PORT: z.coerce.number().default(8852),
  NODE_ENV: z.enum([ "development", "production", "test" ]).default("development"),

  // API KEY
  ROOT_API_KEY: z.string().optional(),
  DEFAULT_RATE_LIMIT: z.coerce.number().optional().default(1000),

  // SECURITY
  ENCRYPT_MASTER_PASSWORD: z.string().optional().default("change-me"),

  // CORS
  CORS_ORIGINS: z.string().transform((s) => s.split(",")).optional()
    .default([ "*", "http://localhost:3000", "http://localhost:5173", "http://localhost:4200" ]),
  CORS_METHODS: z.string().array().optional().default([ "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS" ]),
  CORS_HEADERS: z.string().array().optional().default([ "*" ]),
  CORS_CREDENTIALS: z.boolean().optional().default(true),



  // DATABASE
  DATABASE_URL: z.string(),

  MAX_FIND_LIMIT: z.coerce.number().optional().default(5000),
})

/**
 * The parsed and validated environment variables for the application.
 * This object is exported and used throughout the application to access configuration settings in a type-safe way.
 */
export const env = envSchema.parse(process.env);
