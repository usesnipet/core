import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { StructuredOutputDto } from './dto/structured-output.dto';
import { LLMManagerService } from '@/infra/llm-manager/llm-manager.service';
import { SummaryDto } from './dto/summary.dto';
import { PromptService } from '@snipet/nest-prompt';
import { PromptTemplates } from '@/@generated/prompts/prompts';
import { ExpandDto } from './dto/expand.dto';

@Injectable()
export class UtilitiesService {
  @Inject() llmManager: LLMManagerService;
  @Inject() promptManager: PromptService<typeof PromptTemplates>;

  async getTextProvider() {
    const provider = await this.llmManager.getTextProvider();
    if (!provider) throw new NotFoundException("Text provider not found");
    return provider;
  }

  async structuredOutput(data: StructuredOutputDto) {
    return (await this.getTextProvider()).withStructuredOutput(data.text, data.toZodObject())
  }

  async summary(data: SummaryDto) {
    const textProvider = await this.getTextProvider();
    const promptTemplate = this.promptManager.getTemplate("Summary");
    const prompt = promptTemplate.build({ text: data.text });
    
    const res = await textProvider.generate({
      prompt,
      maxTokens: data.maxTokens,
      temperature: data.temperature,
    });
    
    return { text: res.output }
  }

  async expand(data: ExpandDto) {
    const textProvider = await this.getTextProvider();
    const promptTemplate = this.promptManager.getTemplate("Expand");
    const prompt = promptTemplate.build({ text: data.text });
    
    const res = await textProvider.generate({
      prompt,
      maxTokens: data.maxTokens,
      temperature: data.temperature,
    });

    return { text: res.output }
  }
}