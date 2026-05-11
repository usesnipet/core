import { IsOptional, IsString } from "class-validator";

import { BaseSchema } from "./base";

export class NodeSchema extends BaseSchema {
  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  config?: string;
}
