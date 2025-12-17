import { Column, Entity, Index, OneToMany } from "typeorm";

import { Field } from "../shared/model";
import { BaseEntity } from "./entity";
import { ApiKeyAssignmentEntity } from "./api-key-assignment.entity";
import crypto from "crypto";

@Entity("api_keys")
export class ApiKeyEntity extends BaseEntity {
  @Field({ type: "string", description: "The key of the api key", hidden: true })
  @Index({ unique: true })
  @Column({ length: 64 })
  keyHash: string;

  @Field({ type: "string", description: "The key of the api key", hidden: true })
  key: string;

  @Field({ type: "boolean", description: "Indicates if the api key is the root key", hidden: true })
  @Column({ default: false })
  root?: boolean;

  @Field({ type: "string", description: "The name of the api key" })
  @Column({ type: "varchar", length: 255 })
  name: string;

  @Field({ type: "number", description: "The permissions of the api key", hidden: true })
  @Column({ default: 0 })
  permissions: number;

  @Field({ type: "number", description: "The rate limit of the api key" })
  @Column({ nullable: true })
  rateLimit: number;

  @Field({ type: "boolean", description: "The revoked status of the api key", hidden: true })
  @Column({ default: false })
  revoked: boolean;

  @Field({ type: "date", nullable: true, description: "The expires at of the api key" })
  @Column({ type: "timestamptz", nullable: true })
  expiresAt: Date | null;

  @Field({ type: "class", class: () => ApiKeyAssignmentEntity, isArray: true, required: false })
  @OneToMany(() => ApiKeyAssignmentEntity, (r) => r.apiKey, { cascade: [ "insert", "update" ], eager: true })
  apiKeyAssignments?: ApiKeyAssignmentEntity[];

  constructor(data: Partial<ApiKeyEntity>) {
    super(data);
    Object.assign(this, data);
  }

  compare(key: string) {
    return this.keyHash === ApiKeyEntity.toHash(key);
  }

  static generateKey(env: "development" | "production" | "test" = "development") {
    const envMap = {
      "development": "dev",
      "production": "prod",
      "test": "test"
    }
    return `sk_${envMap[env]}_${crypto.randomBytes(32).toString("hex")}`
  }

  static toHash(key: string) {
    return crypto.createHash("sha256").update(key).digest("hex");
  }
}