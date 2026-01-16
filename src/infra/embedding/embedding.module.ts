import { Module } from "@nestjs/common";
import { LLMManagerModule } from "../llm-manager/llm-manager.module";
import { EmbeddingService } from "./embedding.service";
import { CacheModule } from "../cache/cache.module";

@Module({
  imports: [
    LLMManagerModule,
    CacheModule.register("embedding-cache"),
  ],
  providers: [EmbeddingService],
  exports: [EmbeddingService]
})
export class EmbeddingModule {}
