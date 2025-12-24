import { PromptTemplates } from "@/@generated/prompts/prompts";
import { env } from "@/env";
import { DatabaseModule } from "@/infra/database/database.module";
import { LLMManagerModule } from "@/infra/llm-manager/llm-manager.module";
import { HTTPContextModule } from "@/shared/http-context/http-context.module";
import { Module } from "@nestjs/common";
import { PromptModule } from "@snipet/nest-prompt";

import { KnowledgeModule } from "../../knowledge.module";
import { MemoryModule } from "../../../memory/memory.module";
import { SnipetModule } from "../snipet.module";
import { SnipetMessageController } from "./message.controller";
import { SnipetMessageService } from "./message.service";

@Module({
  imports: [
    HTTPContextModule,
    DatabaseModule,
    KnowledgeModule,
    SnipetModule,
    LLMManagerModule,
    MemoryModule,
    PromptModule.forRoot({
      debug: env.DEBUG_PROMPTS,
      templatesDir: env.PROMPT_TEMPLATES_DIR,
      templates: PromptTemplates
    }),
  ],
  controllers: [SnipetMessageController],
  providers: [SnipetMessageService],
  exports: []
})
export class SnipetMessageModule {}
