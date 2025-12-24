import { CacheModule } from '@/infra/cache/cache.module';
import { Module } from '@nestjs/common';

import { KnowledgeModule } from '../knowledge/knowledge.module';
import { SnipetMemoryModule } from './snipet-memory/snipet-memory.module';
import { SourceMemoryModule } from './source-memory/source-memory.module';

@Module({
  imports: [
    KnowledgeModule,
    CacheModule,
    SnipetMemoryModule,
    SourceMemoryModule
  ],
  exports: [
    SnipetMemoryModule,
    SourceMemoryModule
  ]
})
export class MemoryModule {}
