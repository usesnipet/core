import { Column, Entity, OneToMany } from "typeorm";

import { Field } from "../shared/model";
import { BaseEntity } from "./entity";
import { RoleAssignmentEntity } from "./role-assignment.entity";

@Entity("roles")
export class RoleEntity extends BaseEntity {
  @Field({ type: "string", description: "The name of the role" })
  @Column({ type: "varchar", length: 255 })
  name: string;

  @Field({ type: "class", class: () => RoleAssignmentEntity, isArray: true, required: false })
  @OneToMany(() => RoleAssignmentEntity, (r) => r.role)
  roleAssignments?: RoleAssignmentEntity[];

  constructor(data: Partial<RoleEntity>) {
    super(data);
    Object.assign(this, data);
  }
}