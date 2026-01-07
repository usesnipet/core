import { MemoryType, SnipetEntity, SnipetMemoryEntity } from "@/entities";
import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";

import { SubKnowledgeService } from "@/shared/services/sub-knowledge.service";
import { ExecuteSnipetDto, ExecuteSnipetResponseDto, MemoryMode } from "./dto/execute-snipet.dto";
import { ContextResolver } from "./context-resolver/context-resolver.service";
import { Observable } from "rxjs";
import { ExecutionEvent } from "./types/execution-event";
import { OutputParserService } from "./output-parser/output-parser.service";
import { randomUUID } from "crypto";
import { SnipetMemoryService } from "./memory/snipet-memory.service";
import { As, ReadMemoryAsDto } from "./dto/read-memory-as.dto";
import { FilterOptions } from "@/shared/filter-options";
import { th } from "zod/v4/locales";

@Injectable()
export class SnipetService extends SubKnowledgeService<SnipetEntity> {
  logger = new Logger(SnipetService.name);
  entity = SnipetEntity;

  @Inject() private readonly contextResolver: ContextResolver;
  @Inject() private readonly outputParser: OutputParserService;
  @Inject() private readonly memoryService: SnipetMemoryService;

  private readonly executionStore = new Map<string, ExecuteSnipetDto>();

  execute(data: ExecuteSnipetDto) {
    const executionId = randomUUID();
    this.executionStore.set(executionId, data);
    return new ExecuteSnipetResponseDto(executionId);
  }

  async stream(executionId: string) {
    const execution = this.executionStore.get(executionId);
    if (!execution) throw new NotFoundException("Execution not found");
     return new Observable<ExecutionEvent>((subscriber) => {
      (async () => {
        try {
          const { intent, knowledgeId, query, snipetId, options } = execution;
          subscriber.next({ event: "start" });

          const snipet = await this.findUnique({ where: { id: snipetId, knowledgeId } });
          if (!snipet) {
            subscriber.error(new NotFoundException("Snipet not found"));
            return;
          }

          if (options?.memory?.mode === MemoryMode.CONVERSATION) {
            await this.memoryService.save(execution, MemoryType.USER_INPUT, query);
          }

          // run context resolver
          const context = await this.contextResolver.resolve({
            intent,
            query,
            snipet,
            executeSnipetOptions: options?.contextOptions
          }, subscriber);

          // TODO run action resolver

          // Output parser
          const result = await this.outputParser.execute(execution, context, subscriber);
          await this.memoryService.save(execution, MemoryType.TEXT_ASSISTANT_OUTPUT, result);
          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      })();
      return () => {};
    });
  }

  readMemoryAs(filter: FilterOptions<SnipetMemoryEntity>, data: ReadMemoryAsDto) {
    switch (data.as) {
      case As.CHAT:
        return this.memoryService.readMemoryAsChat(filter);
      default:
        throw new Error("Invalid read memory as");
    }
  }
}