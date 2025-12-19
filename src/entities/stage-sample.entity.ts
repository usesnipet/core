import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('stage_samples')
export class StageSampleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: "run_id" })
  runId: string;

  @Column()
  stage: string;

  @Column({ name: "sample_type" })
  sampleType: 'input' | 'output';

  @Column('jsonb')
  payload: any;

  @Column()
  reason: string; // e.g. high_noise, low_score

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
