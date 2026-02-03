/**
 * @file Manages environment variables for the application.
 *
 * This file uses `dotenv` to load environment variables from a `.env` file and `zod` to validate,
 * parse, and provide default values for them. This ensures that the application's configuration
 * is type-safe and has sensible defaults.
 */

import dotenv from "dotenv";
import path from "path";
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

/**
 * Defines the schema for all environment variables used in the application.
 * `zod` is used to enforce types, provide default values, and perform transformations.
 * This schema covers various aspects of the application's configuration, including:
 * - Application settings (port, environment)
 * - Security (API keys, encryption)
 * - CORS policy
 * - Storage (S3)
 * - Database
 * - Redis
 * - BullMQ Dashboard
 * - Vector store (Milvus)
 * - LLM and prompt settings
 * - File processing
 * - OpenTelemetry
 * - Logging
 */
const envSchema = z.object({
  // APP
  APP_PORT: z.coerce.number().default(3000),
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

  // STORAGE
  STORAGE_TYPE: z.enum(['s3']).default('s3'),
  // S3
  AWS_ACCESS_KEY_ID: z.string().optional().default("minio"),
  AWS_SECRET_ACCESS_KEY: z.string().optional().default("adminadmin"),
  AWS_REGION: z.string().optional().default("us-east-1"),
  AWS_ENDPOINT: z.string().optional().default("http://localhost:9000"),
  AWS_PUBLIC_BUCKET_BASE_URL: z.string().optional().default("http://localhost:9000"),
  AWS_BUCKET: z.string().optional().default("snipet-files"),
  AWS_FORCE_PATH_STYLE: z.coerce.boolean().optional().default(true),

  // DATABASE
  DATABASE_URL: z.string(),

  // REDIS
  REDIS_HOST: z.string().optional().default("localhost"),
  REDIS_PORT: z.coerce.number().optional().default(6379),
  REDIS_USER: z.string().optional().default("default"),
  REDIS_PASSWORD: z.string().optional().default(""),
  REDIS_DB: z.coerce.number().optional().default(0),

  // BULLBOARD
  BULL_BOARD_USER: z.string().optional().default("admin"),
  BULL_BOARD_PASSWORD: z.string().optional().default("admin"),

  // VECTOR
  VECTOR_ENGINE: z.enum([ "milvus" ]).default("milvus"),
  // MILVUS
  MILVUS_URL: z.url().optional().default("localhost:19530"),
  MILVUS_COLLECTION_PREFIX: z.string().optional().default("snipet"),
  MILVUS_RECREATE_COLLECTION: z.string().transform((s) => s === "true").optional(),

  // LLM
  LLM_EMBEDDING_DEFAULT_PROVIDER: z.string().optional().default("ollama"),
  LLM_EMBEDDING_DEFAULT_MODEL: z.string().optional().default("mxbai-embed-large"),
  LLM_EMBEDDING_DEFAULT_DIMENSION: z.coerce.number().optional().default(1024),
  LLM_EMBEDDING_DEFAULT_OPTIONS: z.string().transform((s) => JSON.parse(s)).optional().default({ host: "http://localhost:11434" }),

  LLM_TEXT_DEFAULT_PROVIDER: z.string().optional().default("ollama"),
  LLM_TEXT_DEFAULT_MODEL: z.string().optional().default("all-MiniLM-L6-v2"),
  LLM_TEXT_DEFAULT_OPTIONS: z.string().transform((s) => JSON.parse(s)).optional().default({ host: "http://localhost:11434" }),

  // PROMPT
  PROMPT_TEMPLATES_DIR: z.string().optional().default(path.join(__root, "prompts")),
  DEBUG_PROMPTS: z.coerce.boolean().optional().default(false),

  // PROCESSOR
  DEFAULT_EXTRACTOR: z.enum([ "unstructured", "langchain" ]).optional().default("langchain"),
  EXTRACTOR_SETTINGS: z.string().transform((s) => JSON.parse(s)).optional().default({}),
  // EXTERNAL PROCESSOR - UNSTRUCTURED
  UNSTRUCTURED_API_URL: z.string().optional().default("http://localhost:8000"),

  // FILE LOGGER
  FILE_LOGGER_ENABLED: z.coerce.boolean().optional().default(false),
})

/**
 * The parsed and validated environment variables for the application.
 * This object is exported and used throughout the application to access configuration settings in a type-safe way.
 */
export const env = envSchema.parse(process.env);
