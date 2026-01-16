import { Module } from "@nestjs/common";

import { LLMManagerModule } from "../llm-manager/llm-manager.module";
import { MilvusSnipetVectorStoreService } from "./milvus/snipet/snipet-vector-store.service";
import { MilvusSourceVectorStoreService } from "./milvus/source/source-vector-store.service";
import { SnipetVectorStoreService } from "./snipet-vector-store.service";
import { SourceVectorStoreService } from "./source-vector-store.service";

@Module({
  imports: [ LLMManagerModule ],
  exports: [SourceVectorStoreService, SnipetVectorStoreService],
  providers: [
    {
      provide: SourceVectorStoreService,
      useClass: MilvusSourceVectorStoreService
    },
    {
      provide: SnipetVectorStoreService,
      useClass: MilvusSnipetVectorStoreService
    }
  ]
})
export class VectorStoreModule {}
