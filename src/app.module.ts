import { ExpressAdapter } from "@bull-board/express";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullModule } from "@nestjs/bullmq";
import { ClassSerializerInterceptor, Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { PromptModule } from "@snipet/nest-prompt";
import basicAuth from "express-basic-auth";
import { ClsModule } from "nestjs-cls";

import { PromptTemplates } from "./@generated/prompts/prompts";
import { env } from "./env";
import { LLMManagerModule } from "./infra/llm-manager/llm-manager.module";
import { VectorStoreModule } from "./infra/vector/vector.module";
import { ApiKeyModule } from "./modules/api-key/api-key.module";
import { ConnectorModule } from "./modules/knowledge/connector/connector.module";
import { IngestModule } from "./modules/knowledge/connector/ingest/ingest.module";
import { IntegrationModule } from "./modules/integration/integration.module";
import { KnowledgeModule } from "./modules/knowledge/knowledge.module";
import { HTTPContextModule } from "./shared/http-context/http-context.module";
import { ContextInterceptor } from "./shared/interceptor/context";
import { UtilitiesModule } from "./modules/utilities/utilities.module";
import { ApiKeyGuard } from "./guards/api-key.guard";
import { SnipetModule } from "./modules/knowledge/snipet/snipet.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HTTPContextModule,
    BullModule.forRoot({
      connection: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        username: env.REDIS_USER,
        password: env.REDIS_PASSWORD,
        db: env.REDIS_DB
      }
    }),
    BullBoardModule.forRoot({
      route: "/queues",
      adapter: ExpressAdapter,
      middleware: basicAuth({
        challenge: true,
        users: { [env.BULL_BOARD_USER]: env.BULL_BOARD_PASSWORD }
      })
    }),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        saveReq: true,
        saveRes: true
      }
    }),
    LLMManagerModule,
    VectorStoreModule,
    ConnectorModule,
    IntegrationModule,
    KnowledgeModule,
    ApiKeyModule,
    IngestModule,
    SnipetModule,
    UtilitiesModule,
    PromptModule.forRoot({
      debug: env.DEBUG_PROMPTS,
      templatesDir: env.PROMPT_TEMPLATES_DIR,
      templates: PromptTemplates
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: ContextInterceptor
    // },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor
    }
  ]
})
export class AppModule {}
