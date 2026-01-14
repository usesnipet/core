import { DatabaseModule } from "@/infra/database/database.module";
import { HTTPContextModule } from "@/shared/http-context/http-context.module";
import { Module } from "@nestjs/common";

import { SnipetController } from "./snipet.controller";
import { SnipetService } from "./snipet.service";
import { KnowledgeModule } from "../knowledge.module";
import { EmbeddingModule } from "@/infra/embedding/embedding.module";
import { ContextResolver } from "./context-resolver/context-resolver.service";
import { KnowledgeContextResolver } from "./context-resolver/knowledge.resolver";
import { SnipetContextResolver } from "./context-resolver/snipet.resolver";
import { LLMManagerModule } from "@/infra/llm-manager/llm-manager.module";
import { PromptModule } from "@snipet/nest-prompt";
import { PromptTemplates } from "@/@generated/prompts/prompts";
import { env } from "@/env";
import { VectorStoreModule } from "@/infra/vector/vector.module";
import { OutputParserService } from "./output-parser/output-parser.service";
import { AnswerOutputStrategy } from "./output-parser/answer.parser";
import { SnipetAssetService } from "./assets/snipet-asset.service";
import { ExecutionService } from "./execution.service";

@Module({
  imports: [
    HTTPContextModule,
    DatabaseModule,
    KnowledgeModule,
    EmbeddingModule,
    VectorStoreModule,
    LLMManagerModule,
    PromptModule.forRoot({
      debug: env.DEBUG_PROMPTS,
      templatesDir: env.PROMPT_TEMPLATES_DIR,
      templates: PromptTemplates
    })
  ],
  controllers: [SnipetController],
  providers: [
    // #region Services
    SnipetService,
    // #endregion

    // #region Context Resolvers
    ContextResolver,
    KnowledgeContextResolver,
    SnipetContextResolver,
    // #endregion

    // #region Output Parsers
    OutputParserService,
    AnswerOutputStrategy,
    // #endregion

    SnipetAssetService,

    ExecutionService
  ],
  exports: [ SnipetService ],
})
export class SnipetModule {}
