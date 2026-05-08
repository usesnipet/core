import { Injectable } from "@nestjs/common";
import { BaseCrudService, type CrudIdentity } from "@/common/crud";
import { flow } from "@/db/schema/flow";
import { TransactionManager } from "../database/transaction-manager";
import { FlowEntity } from "./flow.entity";
import { CreateFlowDto } from "./dto/create-flow.dto";
import { UpdateFlowDto } from "./dto/update-flow.dto";

@Injectable()
export class FlowService extends BaseCrudService<typeof flow, FlowEntity, CreateFlowDto, UpdateFlowDto> {
  protected readonly identity: CrudIdentity<typeof flow> = {
    table: flow,
    idColumn: flow.id,
  };

  constructor() {
    super("flow", FlowEntity);
  }
}
