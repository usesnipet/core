import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";

import { Base } from "./base";

export class FlowNodeRef {
  @IsString()
  instanceId!: string;

  @IsString()
  nodeId!: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}

export class FlowConnectionOut {
  @IsString()
  instanceId!: string;

  @IsString()
  outputId!: string;
}

export class FlowConnectionIn {
  @IsString()
  instanceId!: string;

  @IsString()
  inputId!: string;
}

export class FlowConnection {
  @ValidateNested()
  @Type(() => FlowConnectionOut)
  source!: FlowConnectionOut;

  @ValidateNested()
  @Type(() => FlowConnectionIn)
  target!: FlowConnectionIn;

  @IsBoolean()
  active!: boolean;
}

export class Flow extends Base {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowNodeRef)
  nodes!: FlowNodeRef[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowConnection)
  connections!: FlowConnection[];

  constructor(flow: Flow) {
    super();
    Object.assign(this, flow);
  }
}
