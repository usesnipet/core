import {
  DateTimeFilterInput,
  GraphQLFilterArgs,
  StringFilterInput,
} from "@/common/filter/graphql-filter-args";
import { ArgsType, Field, InputType } from "@nestjs/graphql";

@InputType()
export class ConfigWhereInput {
  @Field(() => StringFilterInput, { nullable: true })
  id?: StringFilterInput;

  @Field(() => StringFilterInput, { nullable: true })
  configId?: StringFilterInput;

  @Field(() => StringFilterInput, { nullable: true })
  packageId?: StringFilterInput;

  @Field(() => StringFilterInput, { nullable: true })
  name?: StringFilterInput;

  @Field(() => StringFilterInput, { nullable: true })
  description?: StringFilterInput;

  @Field(() => StringFilterInput, { nullable: true })
  docs?: StringFilterInput;

  @Field(() => StringFilterInput, { nullable: true })
  icon?: StringFilterInput;

  @Field(() => StringFilterInput, { nullable: true })
  author?: StringFilterInput;

  @Field(() => DateTimeFilterInput, { nullable: true })
  createdAt?: DateTimeFilterInput;

  @Field(() => DateTimeFilterInput, { nullable: true })
  updatedAt?: DateTimeFilterInput;
}

@ArgsType()
export class ConfigArgs extends GraphQLFilterArgs(ConfigWhereInput) {}
