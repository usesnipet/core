import {
  BooleanFilterInput, DateTimeFilterInput, GraphQLFilterArgs, StringFilterInput
} from "@/common/filter/graphql-filter-args";
import { ArgsType, Field, InputType } from "@nestjs/graphql";

@InputType()
export class FlowWhereInput {
  @Field(() => StringFilterInput, { nullable: true })
  id?: StringFilterInput;

  @Field(() => StringFilterInput, { nullable: true })
  name?: StringFilterInput;

  @Field(() => StringFilterInput, { nullable: true })
  description?: StringFilterInput;

  @Field(() => BooleanFilterInput, { nullable: true })
  active?: BooleanFilterInput;

  @Field(() => DateTimeFilterInput, { nullable: true })
  createdAt?: DateTimeFilterInput;

  @Field(() => DateTimeFilterInput, { nullable: true })
  updatedAt?: DateTimeFilterInput;
}

@ArgsType()
export class FlowArgs extends GraphQLFilterArgs(FlowWhereInput) {}
