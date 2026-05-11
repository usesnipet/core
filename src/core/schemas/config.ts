

import { IsRecordOf } from "../../decorators/is-record-of";

import { BaseSchema } from "./base";
import { FieldSchema } from "./field";

export class ConfigSchema extends BaseSchema {
  @IsRecordOf(FieldSchema)
  fields!: Record<string, FieldSchema>;
}
