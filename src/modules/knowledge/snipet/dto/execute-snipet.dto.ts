import { ExecutionEntity } from "@/entities/execution.entity";
import { PickType } from "@nestjs/swagger";

export class ExecuteSnipetDto extends PickType(ExecutionEntity, ["snipetId", "options", "knowledgeId"]) {}


export class ExecuteSnipetResponseDto {
  executionId: string;
  constructor(executionId: string) {
    this.executionId = executionId;
  }
}