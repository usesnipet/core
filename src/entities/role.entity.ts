import { Column, Entity, Index, OneToMany } from "typeorm";

import { Field } from "../shared/model";
import { BaseEntity } from "./entity";
import { RoleAssignmentEntity } from "./role-assignment.entity";
import crypto from "crypto";

@Entity("roles")
export class RoleEntity extends BaseEntity {
  @Field({ type: "string", description: "The key of the role" })
  @Index({ unique: true })
  @Column({ length: 64 })
  keyHash: string;

  @Field({ type: "string", description: "The name of the role" })
  @Column({ type: "varchar", length: 255 })
  name: string;

  @Field({ type: "number", description: "The rate limit of the role" })
  @Column({ nullable: true })
  rateLimit: number;

  @Field({ type: "boolean", description: "The revoked status of the role" })
  @Column({ default: false })
  revoked: boolean;

  @Field({ type: "date", nullable: true, description: "The expires at of the role" })
  @Column({ type: "timestamptz", nullable: true })
  expiresAt: Date | null;

  @Field({ type: "class", class: () => RoleAssignmentEntity, isArray: true, required: false })
  @OneToMany(() => RoleAssignmentEntity, (r) => r.role, { cascade: [ "insert", "update" ], eager: true })
  roleAssignments?: RoleAssignmentEntity[];

  constructor(data: Partial<RoleEntity>) {
    super(data);
    Object.assign(this, data);
  }

  compare(key: string) {
    return this.keyHash === RoleEntity.toHash(key);
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