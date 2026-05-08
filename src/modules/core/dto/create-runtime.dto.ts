import { RequiredIf } from "@/decorators";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateRuntimeDto {
  @ApiProperty({ type: String, format: "uuid", required: false, description: "Existing flow id to load from DB" })
  @IsOptional()
  @IsUUID("4")
  @RequiredIf("flowId", (value) => !value, { message: "Provide only one of flowId or flowCode" })
  flowId?: string;

  @ApiProperty({ type: Object, required: false, description: "Flow code (same shape as core Flow schema)" })
  @IsOptional()
  @IsObject()
  @RequiredIf("flowId", (value) => !value, { message: "Provide only one of flowId or flowCode" })
  flowCode?: Record<string, unknown>;

  @ApiProperty({ type: String, required: false, description: "Optional runtime id (otherwise generated)" })
  @IsOptional()
  @IsString()
  id?: string;

}

export class RunRuntimeDto {
  @ApiProperty({ type: String, required: true, description: "Flow node instanceId to start execution from" })
  @IsString()
  @IsNotEmpty()
  startNodeInstanceId!: string;
}

