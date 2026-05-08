import { Type } from "class-transformer";
import { IsArray, IsOptional, ValidateNested } from "class-validator";

import { Metadata } from "./base";
import { Config } from "./config";
import { Node } from "./node";
import { NodeType } from "./node-type";

export class Package {
  @IsOptional()
  @ValidateNested()
  @Type(() => Metadata)
  metadata?: Metadata;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeType)
  nodeTypes!: NodeType[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Config)
  configs!: Config[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Node)
  nodes!: Node[];
}