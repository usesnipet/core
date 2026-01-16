import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";

import { Field } from "../shared/model";
import { BaseEntity } from "./entity";
import { KnowledgeEntity } from "./knowledge.entity";
import { ApiKeyConnectorPermissionEntity } from "./api-key-connector-permission.entity";
import { ApiKeyEntity } from "./api-key.entity";

export enum KbPermission {
  READ = 1 << 0,
  WRITE = 1 << 1,
  MANAGE = 1 << 2
}

@Entity("api_key_assignments")
export class ApiKeyAssignmentEntity extends BaseEntity {
  @Field({ type: "string", required: true, uuid: true, description: "The id of the api key" })
  @Column({ type: "uuid", name: "api_key_id" })
  apiKeyId: string;

  @Field({ type: "enum", enum: KbPermission, required: true, description: "The permissions of the api key" })
  @Column({ type: "enum", enum: KbPermission, name: "kb_permissions" })
  kbPermissions: KbPermission;

  @Field({ type: "string", required: true, uuid: true, description: "The id of the knowledge base" })
  @Column({ type: "uuid", name: "knowledge_base_id" })
  knowledgeId: string;

  @Field({ type: "class", class: () => ApiKeyEntity, required: false, description: "The api key of the api key assignment" })
  @ManyToOne(() => ApiKeyEntity, (apiKey) => apiKey.apiKeyAssignments, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "api_key_id" })
  apiKey?: ApiKeyEntity;

  @Field({ type: "class", class: () => KnowledgeEntity, required: false, description: "The knowledge base of the api key assignment" })
  @ManyToOne(() => KnowledgeEntity, (kb) => kb.apiKeyAssignments, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "knowledge_base_id" })
  knowledge?: KnowledgeEntity;

  @Field({ type: "class", class: () => ApiKeyConnectorPermissionEntity, isArray: true, required: false, description: "The connector permissions of the api key assignment" })
  @OneToMany(() => ApiKeyConnectorPermissionEntity, (c) => c.apiKeyAssignment, { cascade: [ "insert", "update" ], eager: true })
  connectorPermissions?: ApiKeyConnectorPermissionEntity[];

  constructor(data: Partial<ApiKeyAssignmentEntity>) {
    super(data);
    Object.assign(this, data);
  }
}
