import { Type } from "class-transformer";
import {
  IsArray, IsBoolean, IsNumber, IsObject, IsOptional, IsString, ValidateNested
} from "class-validator";

import { BaseSchema, MetadataSchema } from "./base";

export class FlowNodeRefSchema {
  @IsString()
  instanceId!: string;

  @IsString()
  nodeId!: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsNumber()
  x!: number;

  @IsNumber()
  y!: number;
}

export class FlowConnectionOutSchema {
  @IsString()
  instanceId!: string;

  @IsString()
  outputId!: string;
}

export class FlowConnectionInSchema {
  @IsString()
  instanceId!: string;

  @IsString()
  inputId!: string;
}

export class FlowConnectionSchema {
  @ValidateNested()
  @Type(() => FlowConnectionOutSchema)
  source!: FlowConnectionOutSchema;

  @ValidateNested()
  @Type(() => FlowConnectionInSchema)
  target!: FlowConnectionInSchema;

  @IsBoolean()
  active!: boolean;
}

export class FlowSchema extends BaseSchema {
  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataSchema)
  metadata?: MetadataSchema;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowNodeRefSchema)
  nodes!: FlowNodeRefSchema[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowConnectionSchema)
  connections!: FlowConnectionSchema[];

  constructor(flow: FlowSchema) {
    super();
    Object.assign(this, flow);
  }
}
