/**
 * @file This file defines the root module of the NestJS application.
 */
import { ClassSerializerInterceptor, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";

/**
 * The root module of the application.
 *
 * This module orchestrates the entire application by importing and configuring all necessary modules:
 * - `ScheduleModule`: For task scheduling.
 * - `HTTPContextModule`: For managing request-level context.
 * - `BullModule`: For integrating with BullMQ for background job processing.
 * - `BullBoardModule`: For providing a UI to monitor BullMQ queues.
 * - `ClsModule`: For Continuation-Local Storage, enabling request-scoped data.
 * - `LLMManagerModule`, `VectorStoreModule`: Infrastructure modules for AI and vector operations.
 * - Feature modules: `ConnectorModule`, `IntegrationModule`, `KnowledgeModule`, `ApiKeyModule`, etc.
 * - `PromptModule`: For managing and using prompt templates.
 *
 * It also registers global providers:
 * - `ApiKeyGuard`: A global guard to protect endpoints with API key authentication.
 * - `ClassSerializerInterceptor`: A global interceptor to handle entity serialization.
 */
@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    }
  ]
})
export class AppModule {}
