import { CacheModule } from '@/infra/cache/cache.module';
import { KnowledgeModule } from '@/modules/knowledge/knowledge.module';
import { Module } from '@nestjs/common';

import { SnipetMemoryService } from './snipet-memory.service';
import { VectorStoreModule } from '@/infra/vector/vector.module';
import { EmbeddingModule } from '@/infra/embedding/embedding.module';

@Module({
  providers: [SnipetMemoryService],
  imports: [
    VectorStoreModule,
    CacheModule.register("chat-memory"),
    KnowledgeModule,
    EmbeddingModule
  ],
  exports: [SnipetMemoryService]
})
export class SnipetMemoryModule {}
