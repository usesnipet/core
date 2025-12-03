import { Module } from "@nestjs/common";

import { LLMManagerModule } from "../llm-manager/llm-manager.module";
import { MilvusSessionVectorStoreService } from "./milvus/session/session-vector-store.service";
import { MilvusSourceVectorStoreService } from "./milvus/source/source-vector-store.service";
import { SessionVectorStoreService } from "./session-vector-store.service";
import { SourceVectorStoreService } from "./source-vector-store.service";

@Module({
  imports: [ LLMManagerModule ],
  exports: [SourceVectorStoreService, SessionVectorStoreService],
  providers: [
    {
      provide: SourceVectorStoreService,
      useClass: MilvusSourceVectorStoreService
    },
    {
      provide: SessionVectorStoreService,
      useClass: MilvusSessionVectorStoreService
    }
  ]
})
export class VectorStoreModule {}
