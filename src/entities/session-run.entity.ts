// import {
//   Entity,
//   Column,
//   PrimaryGeneratedColumn,
//   ManyToOne,
//   CreateDateColumn,
//   UpdateDateColumn,
//   Index,
//   OneToMany
// } from "typeorm";
// import { SessionEntity } from "./session.entity";
// import { RunStepEntity } from "./run-step.entity";
// import { Field } from "../shared/model";
// import { BaseEntity } from "./entity";

// export enum RunStatus {
//   RUNNING = "RUNNING",
//   WAITING = "WAITING",
//   COMPLETED = "COMPLETED",
//   FAILED = "FAILED",
//   CANCELED = "CANCELED",
// }

// export enum RunType {
//   AGENT = "AGENT",
//   RAG = "RAG",
//   CHAT = "CHAT",
//   WORKFLOW = "WORKFLOW",
//   CUSTOM = "CUSTOM",
// }

// @Entity("session_runs")
// @Index("idx_session_runs_session", ["sessionId"])
// export class SessionRunEntity extends BaseEntity {

//   @Field({ type: "string", required: true, uuid: true })
//   @Column({ type: "uuid", name: "session_id" })
//   sessionId: string;

//   @Field({ type: "class", class: () => SessionEntity, required: false })
//   @ManyToOne(() => SessionEntity, (s) => s.id, { onDelete: "CASCADE" })
//   session?: SessionEntity;

//   @Field({ type: "enum", enum: RunType, required: true })
//   @Column({ type: "enum", enum: RunType, default: RunType.AGENT })
//   type: RunType;

//   @Field({ type: "enum", enum: RunStatus, required: true })
//   @Column({ type: "enum", enum: RunStatus, default: RunStatus.RUNNING })
//   status: RunStatus;

//   @Field({ type: "number", integer: true, required: false, nullable: true })
//   @Column({ type: "int", name: "current_step_index", nullable: true })
//   currentStepIndex?: number | null;

//   @Field({
//     type: "object",
//     additionalProperties: true,
//     required: false,
//     nullable: true
//   })
//   @Column({ type: "jsonb", nullable: true })
//   metadata?: Record<string, any> | null;

//   @Field({ type: "string", required: false, nullable: true })
//   @Column({ type: "varchar", length: 255, nullable: true, name: "trigger_id" })
//   triggerId?: string | null;

//   @Field({ type: "class", class: () => RunStepEntity, isArray: true })
//   @OneToMany(() => RunStepEntity, (s) => s.run, { cascade: true })
//   steps?: RunStepEntity[];
// }
