import { Column, Entity, JoinColumn, ManyToOne, OneToOne, Unique } from "typeorm";
import { SessionEntity } from "./session.entity";
import { Field } from "../shared/model";

@Entity("session_contexts")
@Unique("session_id", ["sessionId"])
export class SessionContextEntity {
  @Field({
    type: "string",
    required: true,
    uuid: true,
    description: "The unique identifier for the session context"
  })
  @Column({ name: "session_id", type: "uuid", primary: true })
  sessionId: string;

  @Field({ type: "string", required: false, nullable: true })
  @Column({ type: "varchar", nullable: true })
  state: string | null;

  @Field({ type: "class", class: () => SessionEntity, required: false })
  @OneToOne(() => SessionEntity, (session) => session.context)
  @JoinColumn({ name: "session_id" })
  session?: SessionEntity;

  @Field({
    type: "object",
    additionalProperties: {
      type: "object",
      properties: {
        runId: { type: "string" },
        stepIndex: { type: "number" },
        status: { type: "string" }
      }
    },
    required: false,
    nullable: true
  })
  @Column({ type: "jsonb", nullable: true })
  lastRun?: {
    runId: string;
    stepIndex: number;
    status: string;
  } | null;

  constructor(partial: Partial<SessionContextEntity>) {
    Object.assign(this, partial);
  }
}