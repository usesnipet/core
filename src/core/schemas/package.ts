import { Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";

import { Config } from "./config";
import { Node } from "./node";
import { NodeType } from "./node-type";

export class Package {
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