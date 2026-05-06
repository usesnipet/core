import { IsOptional, IsString } from "class-validator";

import { Base } from "./base";

export class Node extends Base {
  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  config?: string;
}
