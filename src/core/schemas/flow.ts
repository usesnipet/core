import { JsonObject } from "@/common/graphql/json-object";
import { Field, ObjectType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import {
  IsArray, IsBoolean, IsNumber, IsObject, IsOptional, IsString, ValidateNested
} from "class-validator";

import { BaseSchema } from "./base";

@ObjectType()
export class FlowNodeRefSchema {
  @IsString()
  @Field(() => String)
  instanceId!: string;

  @IsString()
  @Field(() => String)
  nodeId!: string;

  @IsOptional()
  @IsObject()
  @Field(() => JsonObject, { nullable: true })
  config?: Record<string, unknown>;

  @IsNumber()
  @Field(() => Number)
  x!: number;

  @IsNumber()
  @Field(() => Number)
  y!: number;
}

@ObjectType()
export class FlowConnectionOutSchema {
  @IsString()
  @Field(() => String)
  instanceId!: string;

  @IsString()
  @Field(() => String)
  outputId!: string;
}

@ObjectType()
export class FlowConnectionInSchema {
  @IsString()
  @Field(() => String)
  instanceId!: string;

  @IsString()
  @Field(() => String)
  inputId!: string;
}

@ObjectType()
export class FlowConnectionSchema {
  @ValidateNested()
  @Type(() => FlowConnectionOutSchema)
  @Field(() => FlowConnectionOutSchema)
  source!: FlowConnectionOutSchema;

  @ValidateNested()
  @Type(() => FlowConnectionInSchema)
  @Field(() => FlowConnectionInSchema)
  target!: FlowConnectionInSchema;

  @IsBoolean()
  @Field(() => Boolean)
  active!: boolean;
}

@ObjectType()
export class FlowSchema extends BaseSchema {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowNodeRefSchema)
  @Field(() => [FlowNodeRefSchema])
  nodes!: FlowNodeRefSchema[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowConnectionSchema)
  @Field(() => [FlowConnectionSchema])
  connections!: FlowConnectionSchema[];

  constructor(flow: FlowSchema) {
    super();
    Object.assign(this, flow);
  }
}
