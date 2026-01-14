import { ExecuteSnipetOptions } from "@/entities/execution.entity";
import { Field } from "@/shared/model";

export class ExecuteSnipetDto {
  @Field({ type: "string", uuid: true, source: "params" })
  knowledgeId: string;

  @Field({ type: "string", uuid: true, source: "params" })
  snipetId: string;

  @Field({ type: "class", class: () => ExecuteSnipetOptions })
  options: ExecuteSnipetOptions;
}

export class ExecuteSnipetResponseDto {
  @Field({ type: "string", required: true, uuid: true })
  executionId: string;

  constructor(executionId: string) {
    this.executionId = executionId;
  }
}