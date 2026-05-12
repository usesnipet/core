import { JsonObject } from "@/common/graphql/json-object";
import {
  FlowConnectionInSchema, FlowConnectionOutSchema, FlowConnectionSchema, FlowNodeRefSchema, FlowSchema
} from "@/core/schemas/flow";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class FlowNodeRef extends FlowNodeRefSchema {
  @Field(() => JsonObject, { nullable: true })
  declare config: Record<string, unknown>;

  @Field(() => String)
  declare nodeId: string;

  @Field(() => String)
  declare instanceId: string;

  @Field(() => Number)
  declare x: number;

  @Field(() => Number)
  declare y: number;
}

@ObjectType()
export class FlowConnectionIn extends FlowConnectionInSchema {
  @Field(() => String)
  declare instanceId: string;

  @Field(() => String)
  declare inputId: string;
}

@ObjectType()
export class FlowConnectionOut extends FlowConnectionOutSchema {
  @Field(() => String)
  declare instanceId: string;

  @Field(() => String)
  declare outputId: string;
}

@ObjectType()
export class FlowConnection extends FlowConnectionSchema {
  @Field(() => FlowConnectionOut)
  declare source: FlowConnectionOut;

  @Field(() => FlowConnectionIn)
  declare target: FlowConnectionIn;
}

@ObjectType()
export class FlowCode extends FlowSchema {
  @Field(() => String)
  declare name: string;

  @Field(() => String, { nullable: true })
  declare description?: string;

  @Field(() => String, { nullable: true })
  declare icon?: string;

  @Field(() => String, { nullable: true })
  declare author?: string;

  @Field(() => [FlowNodeRef])
  declare nodes: FlowNodeRef[];

  @Field(() => [FlowConnection])
  declare connections: FlowConnection[];

  constructor(flow: FlowCode) {
    super(flow);
    Object.assign(this, flow);
  }
}