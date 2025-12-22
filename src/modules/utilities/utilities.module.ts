import { Module } from '@nestjs/common';
import { UtilitiesController } from './utilities.controller';
import { UtilitiesService } from './utilities.service';
import { LLMManagerModule } from '@/infra/llm-manager/llm-manager.module';
import { PromptModule } from '@snipet/nest-prompt';
import { env } from '@/env';
import { PromptTemplates } from '@/@generated/prompts/prompts';

@Module({
  controllers: [UtilitiesController],
  providers: [UtilitiesService],
  exports: [UtilitiesService],
  imports: [
    LLMManagerModule,
    PromptModule.forRoot({
      debug: env.DEBUG_PROMPTS,
      templatesDir: env.PROMPT_TEMPLATES_DIR,
      templates: PromptTemplates
    }),
  ]
})
export class UtilitiesModule {}