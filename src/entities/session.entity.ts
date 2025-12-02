import { Column, Entity, Index, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { BaseEntity } from "./entity";
import { Field } from "../shared/model";
import { SessionContextEntity } from "./session-context.entity";
import { SessionMessageEntity } from "./session-message.entity";

export enum SessionType {
  CHAT = "CHAT",
}

@Entity("sessions")
@Index("session_name", ["name"])
export class SessionEntity extends BaseEntity {
  @Field({ type: "string", required: false, nullable: true })
  @Column({ type: "varchar", nullable: true })
  name?: string | null;

  @Field({ type: "enum", enum: SessionType, required: true })
  @Column({ type: "enum", enum: SessionType, default: SessionType.CHAT })
  type: SessionType;

  @Field({
    type: "object",
    additionalProperties: true,
    required: false,
    nullable: true
  })
  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any> | null;

  @Field({ type: "string", uuid: true, required: true })
  @Column({ type: "uuid", name: "knowledge_id" })
  knowledgeId: string;

  @Field({ type: "class", class: () => SessionContextEntity })
  @OneToOne(() => SessionContextEntity, (context) => context.session)
  context: SessionContextEntity;

  @Field({ type: "class", class: () => SessionMessageEntity, isArray: true })
  @OneToMany(() => SessionMessageEntity, (message) => message.session)
  messages: SessionMessageEntity[];

  constructor(partial: Partial<SessionEntity>) {
    super(partial);
    Object.assign(this, partial);
  }
}