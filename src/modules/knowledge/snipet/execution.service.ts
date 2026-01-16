import { ExecutionEntity, ExecutionState } from "@/entities/execution.entity";
import { Service } from "@/shared/service";
import { Injectable, Logger } from "@nestjs/common";
import { EntityManager, UpdateResult } from "typeorm";

@Injectable()
export class ExecutionService extends Service<ExecutionEntity> {
  entity = ExecutionEntity;
  logger = new Logger(ExecutionService.name);

  updateState(executionId: string, state: ExecutionState.ERROR, error: string, manager?: EntityManager): Promise<UpdateResult>;
  updateState(executionId: string, state: ExecutionState, manager?: EntityManager): Promise<UpdateResult>;
  updateState(
    executionId: string,
    state: ExecutionState,
    errorOrManager?: string | EntityManager,
    maybeManager?: EntityManager
  ): Promise<UpdateResult> {
    const error = typeof errorOrManager === "string" ? errorOrManager : undefined;
    const manager = (typeof errorOrManager !== "string" ? errorOrManager : maybeManager) as EntityManager | undefined;

    return this.repository(manager).update(executionId, {
      state,
      result: {
        ...(error ? { error } : {})
      }
    });
  }
}