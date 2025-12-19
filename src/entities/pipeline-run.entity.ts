import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

import { Field } from "../shared/model";

@Entity('pipeline_runs')
export class PipelineRunEntity {
  @Field({ type: "string", uuid: true })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ type: "string" })
  @Column({ name: "knowledge_id" })
  knowledgeId: string;

  @Field({ type: "string" })
  @Column({ name: "document_id" })
  documentId: string;

  @Field({ type: "string" })
  @Column()
  status: 'running' | 'completed' | 'failed';

  @Field({ type: "date" })
  @Column({ name: "started_at" })
  startedAt: Date;

  @Field({ type: "date", nullable: true })
  @Column({ name: "finished_at", nullable: true })
  finishedAt?: Date;
}
