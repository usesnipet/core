/**
 * @file This is the entry point of the application.
 * It bootstraps the NestJS application, sets up middleware, configures API documentation, and starts the server.
 */

import "reflect-metadata";
import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import cookieParser from "cookie-parser";

import { AppModule } from "./app.module";
import { env } from "./env";
import { generateApi } from "./generate-api";
import { ErrorsInterceptor } from "./interceptors/error.interceptor";
import { FileLogger } from "./lib/file-logger";
import "./utils/$log";
import "./tracing";

/**
 * Bootstraps and runs the NestJS application.
 *
 * This function performs the following steps:
 * 1.  Creates a NestJS application instance, optionally using a `FileLogger`.
 * 2.  Applies global interceptors (`ErrorsInterceptor`) and pipes (`ValidationPipe`).
 * 3.  Sets a global prefix for all API routes (`/api`).
 * 4.  Configures Cross-Origin Resource Sharing (CORS) based on environment variables.
 * 5.  Builds the OpenAPI (Swagger) documentation configuration.
 * 6.  Creates the OpenAPI document.
 * 7.  Sets up two API documentation UIs:
 *     - `@scalar/nestjs-api-reference` at the `/scalar` endpoint.
 *     - `SwaggerModule` at the `/swagger` endpoint.
 * 8.  Applies `cookie-parser` middleware.
 * 9.  Calls `generateApi` to write the `swagger.yaml` file if changes are detected.
 * 10. Starts the application server on the port defined by `env.APP_PORT`.
 * 11. Logs a message indicating that the server is running.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: env.FILE_LOGGER_ENABLED ? new FileLogger() : undefined
  });

  app.useGlobalInterceptors(new ErrorsInterceptor());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: false }));

  app.setGlobalPrefix("api");
  app.enableCors({
    origin: env.CORS_ORIGINS, // ou "*"
    methods: env.CORS_METHODS,
    allowedHeaders: env.CORS_HEADERS,
    credentials: env.CORS_CREDENTIALS
  });

  const config = new DocumentBuilder()
    .addApiKey({ type: "apiKey", name: "x-api-key", in: "header", description: "API Key" }, "x-api-key")
    .setTitle("Snipet core API")
    .setDescription("The Snipet API description")
    .setVersion("1.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use("/scalar", apiReference({ content: document }));
  SwaggerModule.setup("swagger", app, document);

  app.use(cookieParser());

  await generateApi(document);
  await app.listen(env.APP_PORT);
  const logger = new Logger("Bootstrap");
  logger.log(`Server running on [${await app.getUrl()}]`);
}

bootstrap();
