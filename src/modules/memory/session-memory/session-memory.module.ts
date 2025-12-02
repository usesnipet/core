import { CacheModule } from '@/infra/cache/cache.module';
import { KnowledgeModule } from '@/modules/knowledge/knowledge.module';
import { Module } from '@nestjs/common';

import { SessionMemoryService } from './session-memory.service';
import { VectorStoreModule } from '@/infra/vector/vector.module';

@Module({
  providers: [SessionMemoryService],
  imports: [
    VectorStoreModule,
    CacheModule.register("chat-memory"),
    KnowledgeModule,
  ],
  exports: [SessionMemoryService]
})
export class SessionMemoryModule {}
