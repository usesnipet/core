import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { Field } from "../shared/model";

export class BaseEntity {
  @Field({ type: "string", uuid: true, description: "The unique identifier for the entity" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field({ type: "date", description: "The timestamp when the entity was created" })
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @Field({ type: "date", description: "The timestamp when the entity was last updated" })
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;

  constructor(partial: Partial<BaseEntity>) {
    Object.assign(this, partial);
  }
}