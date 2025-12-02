import { CacheModule } from '@/infra/cache/cache.module';
import { Module } from '@nestjs/common';

import { KnowledgeModule } from '../knowledge/knowledge.module';
import { SessionMemoryModule } from './session-memory/session-memory.module';
import { SourceMemoryModule } from './source-memory/source-memory.module';

@Module({
  imports: [
    KnowledgeModule,
    CacheModule,
    SessionMemoryModule,
    SourceMemoryModule
  ],
  exports: [
    SessionMemoryModule,
    SourceMemoryModule
  ]
})
export class MemoryModule {}
