import { Type } from "class-transformer";
import { IsBoolean, IsOptional, IsString } from "class-validator";

import { IsRecordOf } from "../../decorators/is-record-of";

import { Base } from "./base";
import { Field } from "./field";

export class NodeTypeComponent {
  @IsString()
  type!: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;
}

export class NodeType extends Base {
  @IsOptional()
  @IsRecordOf(Field)
  @Type(() => Field)
  inputs?: Record<string, Field>;

  @IsOptional()
  @IsRecordOf(Field)
  @Type(() => Field)
  outputs?: Record<string, Field>;

  @IsOptional()
  @IsRecordOf(NodeTypeComponent)
  @Type(() => NodeTypeComponent)
  components?: Record<string, NodeTypeComponent>;

  @IsOptional()
  @IsString()
  category?: string;
}