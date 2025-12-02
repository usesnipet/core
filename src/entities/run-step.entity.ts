// import {
//   Entity,
//   Column,
//   PrimaryGeneratedColumn,
//   ManyToOne,
//   CreateDateColumn,
//   UpdateDateColumn,
//   Index,
//   JoinColumn
// } from "typeorm";
// import { SessionRunEntity } from "./session-run.entity";
// import { BaseEntity } from "./entity";
// import { Field } from "../shared/model";
// import { ConnectorEntity } from "./connector.entity";

// export enum RunStepType {
//   LLM = "LLM",
//   INTEGRATION_SEARCH = "INTEGRATION_SEARCH",
//   INTEGRATION_CONTENT = "INTEGRATION_CONTENT",
//   TOOL = "TOOL",
//   ACTION = "ACTION",
//   EMBEDDING = "EMBEDDING",
//   COMPUTE = "COMPUTE",
//   CUSTOM = "CUSTOM",
// }

// export enum RunStepStatus {
//   PENDING = "PENDING",
//   RUNNING = "RUNNING",
//   WAITING = "WAITING",
//   DONE = "DONE",
//   ERROR = "ERROR",
//   SKIPPED = "SKIPPED",
//   RETRYING = "RETRYING"
// }

// @Entity("run_steps")
// @Index("idx_run_steps_runid_index", ["runId", "index"])
// @Index("idx_run_steps_status", ["status"])
// export class RunStepEntity extends BaseEntity {
//   @Field({ type: "string", required: true, uuid: true })
//   @Column({ type: "uuid", name: "run_id" })
//   runId: string;

//   @Field({ type: "class", class: () => SessionRunEntity, required: false })
//   @ManyToOne(() => SessionRunEntity, (r) => r.steps, { onDelete: "CASCADE" })
//   @JoinColumn({ name: "run_id" })
//   run?: SessionRunEntity;

//   /**
//    * Ordinal index in the run (0-based). Use this to order steps.
//    */
//   @Field({ type: "number", integer: true, required: true })
//   @Column({ type: "int", name: "index" })
//   index: number;

//   @Field({ type: "enum", enum: RunStepType, required: true })
//   @Column({ type: "enum", enum: RunStepType, default: RunStepType.CUSTOM })
//   type: RunStepType;

//   @Field({ type: "enum", enum: RunStepStatus, required: true })
//   @Column({ type: "enum", enum: RunStepStatus, default: RunStepStatus.PENDING })
//   status: RunStepStatus;

//   @Field({
//     type: "object",
//     additionalProperties: true,
//     required: false,
//     nullable: true
//   })
//   @Column({ type: "jsonb", nullable: true })
//   input?: Record<string, any> | null;

//   @Field({
//     type: "object",
//     additionalProperties: true,
//     required: false,
//     nullable: true
//   })
//   @Column({ type: "jsonb", nullable: true })
//   output?: Record<string, any> | null;

//   @Field({ type: "string", uuid: true, required: false, nullable: true })
//   @Column({ type: "uuid", name: "connector_id", nullable: true })
//   connectorId?: string | null;

//   @Field({ type: "number", integer: true, required: true })
//   @Column({ type: "int", default: 0, name: "attempt_count" })
//   attemptCount: number;

//   @Field({ type: "string", required: false, nullable: true })
//   @Column({ type: "text", nullable: true })
//   errorMessage?: string | null;

//   @Field({
//     type: "object",
//     additionalProperties: true,
//     required: false,
//     nullable: true
//   })
//   @Column({ type: "jsonb", nullable: true })
//   errorDetails?: any | null;

//   @Field({ type: "date", required: false, nullable: true })
//   @Column({ type: "timestamp with time zone", name: "started_at", nullable: true })
//   startedAt?: Date | null;

//   @Field({ type: "date", required: false, nullable: true })
//   @Column({ type: "timestamp with time zone", name: "finished_at", nullable: true })
//   finishedAt?: Date | null;

//   connector?: ConnectorEntity;
// }
