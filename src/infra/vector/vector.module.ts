import { Module } from "@nestjs/common";

import { MilvusSourceVectorStoreService } from "./milvus/source/source-vector-store.service";
import { SourceVectorStoreService } from "./source-vector-store.service";
import { LLMManagerModule } from "../llm-manager/llm-manager.module";
import { SessionVectorStoreService } from "./session-vector-store.service";

@Module({
  imports: [ LLMManagerModule ],
  exports: [SourceVectorStoreService],
  providers: [
    {
      provide: SourceVectorStoreService,
      useClass: MilvusSourceVectorStoreService
    },
    {
      provide: SessionVectorStoreService,
      useClass: MilvusSourceVectorStoreService
    }
  ]
})
export class VectorStoreModule {}
