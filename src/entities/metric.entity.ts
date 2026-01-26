import { ApiExtraModels } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Field } from "../shared/model";

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
export class MetricEntity {
  @Field({ type: "string", uuid: true, description: "The unique identifier for the entity" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field({ type: "class", class: () => ModelMetric, required: false })
  @Column(() => ModelMetric, { prefix: "model" })
  modelMetric?: ModelMetric;

  @Field({ type: "date", description: "The timestamp when the entity was created" })
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @Field({ type: "date", description: "The timestamp when the entity was last updated" })
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;


}