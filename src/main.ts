import { ValidationPipe } from "@nestjs/common";
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
}

bootstrap();
