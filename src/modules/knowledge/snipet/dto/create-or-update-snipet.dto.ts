import { SnipetEntity } from "@/entities";
import { KnowledgeId } from "@/shared/controller/decorators";
import { ApiProperty, PickType } from "@nestjs/swagger";
import { Expose, Transform, Type } from "class-transformer";
import { IsOptional, Allow } from "class-validator";

export class CreateOrUpdateSnipetDto extends PickType(SnipetEntity, ['name', "metadata"]) {
  @KnowledgeId()
  knowledgeId: string;
  
  @Expose()
  @IsOptional()
  @Allow()
  @Transform(({ value }) => value, { toClassOnly: true })
  @ApiProperty({ type: Object, required: false, nullable: true })
  override metadata: Record<string, any>;
}