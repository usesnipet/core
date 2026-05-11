import { GraphQLFilterArgs, StringFilterInput } from "@/common/filter/graphql-filter-args";
import { ArgsType, Field, InputType } from "@nestjs/graphql";

@InputType()
export class TagWhereInput {
  @Field(() => StringFilterInput, { nullable: true })
  id?: StringFilterInput;

  @Field(() => StringFilterInput, { nullable: true })
  name?: StringFilterInput;
}

@ArgsType()
export class TagArgs extends GraphQLFilterArgs(TagWhereInput) {}
