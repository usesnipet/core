/**
 * @file This is the entry point of the application.
 * It bootstraps the NestJS application, sets up middleware, configures API documentation, and starts the server.
 */

import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import "reflect-metadata";
import fs from "fs";
import { AppModule } from "./app.module";
import { env } from "./env";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

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
  fs.writeFileSync("swagger-spec.json", JSON.stringify(document, null, 2));
  SwaggerModule.setup("swagger", app, document);

  app.use(cookieParser());

  await app.listen(env.APP_PORT);
  const logger = new Logger("Bootstrap");
  logger.log(`Server running on [${await app.getUrl()}]`);
}

bootstrap();
