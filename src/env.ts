import dotenv from "dotenv";
import path from "path";
import z from "zod";

import { __root } from "./root";

const envFile = process.env.ENV_FILE;

const buildEnvPaths = (envFile?: string): string[] => {
  if (envFile) {
    return [ envFile, `../../${envFile}` ];
  }
  return [ ".env", "../../.env", "../../.env.local" ];
};

dotenv.config({
  path: buildEnvPaths(envFile)
});

const envSchema = z.object({
  // APP
  APP_PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum([ "development", "production", "test" ]).default("development"),

  // SECURITY
  ENCRYPT_MASTER_PASSWORD: z.string().optional().default("change-me"),

  // CORS
  CORS_ORIGINS: z.string().transform((s) => s.split(",")).optional()
    .default([ "*", "http://localhost:3000", "http://localhost:5173" ]),
  CORS_METHODS: z.string().array().optional().default([ "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS" ]),
  CORS_HEADERS: z.string().array().optional().default([ "*" ]),
  CORS_CREDENTIALS: z.boolean().optional().default(true),

  FILE_UPLOAD_PATH: z.string().optional().default("./uploads"),

  // DATABASE
  DATABASE_URL: z.string(),
  CREATE_DATABASE: z.coerce.boolean().optional().default(false),

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
  LLM_EMBEDDING_DEFAULT_PRESET_KEY: z.string().optional().default(""),
  LLM_EMBEDDING_DEFAULT_CONFIG: z.string().transform((s) => JSON.parse(s)).optional().default({}),

  LLM_TEXT_DEFAULT_PRESET_KEY: z.string().optional().default(""),
  LLM_TEXT_DEFAULT_CONFIG: z.string().transform((s) => JSON.parse(s)).optional().default({}),

  // PROMPT
  PROMPT_TEMPLATES_DIR: z.string().optional().default(path.join(__root, "prompts")),
  DEBUG_PROMPTS: z.coerce.boolean().optional().default(false),

  // OPEN TELEMETRY
  OTEL_ENABLED: z.coerce.boolean().optional().default(false),
  OTEL_LOGS_EXPORTER: z.string().optional().default("none"),
  OTEL_TRACES_EXPORTER: z.string().optional().default("otlp"),
  OTEL_METRICS_EXPORTER: z.string().optional().default("otlp"),

  OTEL_EXPORTER_OTLP_PROTOCOL: z.string().optional().default("grpc"),
  OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: z.string().optional().default("http://opentelemetry-collector:4317"),

  OTEL_METRIC_EXPORT_INTERVAL: z.coerce.number().default(5000),
  OTEL_METRIC_EXPORT_TIMEOUT: z.coerce.number().default(5000)
})

export const env = envSchema.parse(process.env);
