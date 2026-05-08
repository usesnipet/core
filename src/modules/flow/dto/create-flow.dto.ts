import { OmitType } from "@nestjs/swagger";

import { FlowEntity } from "../flow.entity";

export class CreateFlowDto
  extends OmitType(FlowEntity, ["id", "createdAt", "updatedAt", "active"] as const) {}
