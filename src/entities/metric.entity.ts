import { Column, Entity } from "typeorm";
import { BaseEntity } from "./entity";
import { Field } from "@/shared/model";
import { ApiExtraModels } from "@nestjs/swagger";

export enum MetricModelType {
  EMBEDDING = "embedding",
  TEXT = "text",
}

export class ModelMetric {
  @Field({ type: "string", max: 255, required: false, description: "The code of the model used" })
  @Column({ length: 255, nullable: true })
  model?: string;

  @Field({
    type: "enum",
    enum: MetricModelType,
    required: false,
    description: "The type of the operation"
  })
  @Column({ length: 255 })
  operationType: MetricModelType;

  @Field({ type: "number", required: false, description: "The number of tokens used" })
  @Column()
  tokens: number;

  @Field({ type: "number", required: false, description: "The estimated cost of the operation (USD)" })
  @Column()
  estimateCost: number;
}

@ApiExtraModels(
  ModelMetric
)
@Entity("metrics")
export class MetricEntity extends BaseEntity {
  @Field({ type: "class", class: () => ModelMetric, required: false })
  @Column(() => ModelMetric, { prefix: "model" })
  modelMetric?: ModelMetric;

}