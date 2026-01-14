import { SnipetEntity, SnipetMemoryEntity } from "@/entities";
import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";

import { SubKnowledgeService } from "@/shared/services/sub-knowledge.service";
import { ExecuteSnipetDto, ExecuteSnipetResponseDto } from "./dto/execute-snipet.dto";
import { ContextResolver } from "./context-resolver/context-resolver.service";
import { Observable } from "rxjs";
import { ExecutionEvent } from "./types/execution-event";
import { OutputParserService } from "./output-parser/output-parser.service";
import { ExecutionService } from "./execution.service";
import { ExecutionEntity, ExecutionState } from "@/entities/execution.entity";
import { SnipetAssetService } from "./assets/snipet-asset.service";

@Injectable()
export class SnipetService extends SubKnowledgeService<SnipetEntity> {
  logger = new Logger(SnipetService.name);
  entity = SnipetEntity;

  @Inject() private readonly contextResolver: ContextResolver;
  @Inject() private readonly outputParser: OutputParserService;

  @Inject() private readonly assetService: SnipetAssetService;
  @Inject() private readonly executionService: ExecutionService;

  async execute(data: ExecuteSnipetDto) {
    const execution = await this.executionService.create(new ExecutionEntity(data));
    return new ExecuteSnipetResponseDto(execution.id);
  }

  async stream(executionId: string) {
    const execution = await this.executionService.findByID(executionId);
    if (!execution) throw new NotFoundException("Execution not found");
     return new Observable<ExecutionEvent>((subscriber) => {
      (async () => {
        try {
          const { knowledgeId, snipetId, options } = execution;
          subscriber.next({ event: "start" });
          this.executionService.updateState(executionId, ExecutionState.RUNNING);

          const snipet = await this.findUnique({ where: { id: snipetId, knowledgeId } });
          if (!snipet) {
            subscriber.error(new NotFoundException("Snipet not found"));
            return;
          }

          await this.assetService.checkAndSaveUserInput(execution);

          // run context resolver
          const context = await this.contextResolver.resolve({
            intent: options.intent,
            query: options.query,
            snipet,
            executeSnipetOptions: options?.contextOptions
          }, subscriber);
          await this.assetService.checkAndSaveContext(execution, context);

          // TODO run action resolver

          // Output parser
          const result = await this.outputParser.execute(execution, context, subscriber);
          await this.assetService.checkAndSaveOutput(execution, result);

          subscriber.complete();

          await this.executionService.updateState(executionId, ExecutionState.FINISHED);
        } catch (error) {
          console.error(error);

          await this.executionService.updateState(executionId, ExecutionState.ERROR, error.message);
          subscriber.error(error);
        }
      })();
      return () => {};
    });
  }
}