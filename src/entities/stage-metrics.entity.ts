import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

import { Field } from "../shared/model";

@Entity('stage_metrics')
export class StageMetricEntity {
  @Field({ type: "number", integer: true, })
  @PrimaryGeneratedColumn()
  id: number;

  @Field({ type: "string", uuid: true })
  @Column({ name: "run_id" })
  runId: string;

  @Field({ type: "string" })
  @Column({ name: "stage" })
  stage: string; // e.g. stage-2.3

  @Field({ type: "string" })
  @Column()
  metric: string; // e.g. noise_rate

  @Column('float')
  @Field({ type: "number" })
  value: number;

  @Column({ nullable: true })
  @Field({ type: "string" })
  dimension?: string; // extractor, model, etc

  @CreateDateColumn({ name: "created_at" })
  @Field({ type: "date" })
  createdAt: Date;
}
