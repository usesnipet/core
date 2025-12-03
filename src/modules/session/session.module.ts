import { PromptTemplates } from "@/@generated/prompts/prompts";
import { env } from "@/env";
import { CacheModule } from "@/infra/cache/cache.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { LLMManagerModule } from "@/infra/llm-manager/llm-manager.module";
import { VectorStoreModule } from "@/infra/vector/vector.module";
import { HTTPContextModule } from "@/shared/http-context/http-context.module";
import { Module } from "@nestjs/common";
import { PromptModule } from "@snipet/nest-prompt";

import { KnowledgeModule } from "../knowledge/knowledge.module";
import { MemoryModule } from "../memory/memory.module";
import { SessionController } from "./session.controller";
import { SessionService } from "./session.service";

@Module({
  imports: [
    HTTPContextModule,
    DatabaseModule,
    VectorStoreModule,
    KnowledgeModule,
    CacheModule.register("session"),
    LLMManagerModule,
    MemoryModule,
    PromptModule.forRoot({
      debug: env.DEBUG_PROMPTS,
      templatesDir: env.PROMPT_TEMPLATES_DIR,
      templates: PromptTemplates
    }),
  ],
  controllers: [SessionController],
  providers: [SessionService],
  exports: []
})
export class SessionModule {}
