import { Constructable } from "@/types";
import { ArgsType, Field, InputType, Int } from "@nestjs/graphql";
import { Allow, IsOptional, Max, Min } from "class-validator";

/**
 * String / ID / text column filters. Conversion to {@link FilterWhere} happens in
 * {@link graphqlWhereFromFieldKinds} / {@link GraphQLFilterConverter.toFilterOptions}.
 */
@InputType()
export class StringFilterInput {
  @Field(() => String, { nullable: true })
  eq?: string | null;

  @Field(() => String, { nullable: true })
  ne?: string | null;

  @Field(() => [String], { nullable: true })
  in?: string[] | null;

  @Field(() => String, { nullable: true })
  contains?: string | null;

  @Field(() => String, { nullable: true })
  like?: string | null;

  @Field(() => String, { nullable: true })
  ilike?: string | null;

  @Field(() => String, { nullable: true })
  gt?: string | null;

  @Field(() => String, { nullable: true })
  gte?: string | null;

  @Field(() => String, { nullable: true })
  lt?: string | null;

  @Field(() => String, { nullable: true })
  lte?: string | null;
}

@InputType()
export class BooleanFilterInput {
  @Field(() => Boolean, { nullable: true })
  eq?: boolean | null;
}

/** Date/time column filters (ISO-8601 in transport). */
@InputType()
export class DateTimeFilterInput {
  @Field(() => Date, { nullable: true })
  eq?: Date | null;

  @Field(() => Date, { nullable: true })
  ne?: Date | null;

  @Field(() => Date, { nullable: true })
  gt?: Date | null;

  @Field(() => Date, { nullable: true })
  gte?: Date | null;

  @Field(() => Date, { nullable: true })
  lt?: Date | null;

  @Field(() => Date, { nullable: true })
  lte?: Date | null;
}

export function GraphQLFilterArgs<TWhere extends object = any>(Where: Constructable<TWhere>) {
  @ArgsType()
  class GraphQLFilterArgs<TWhere extends object = any> {
    @Field(() => Int, { nullable: true, defaultValue: 1000 })
    @IsOptional()
    @Min(1)
    @Max(5000)
    take?: number;

    @Field(() => Int, { nullable: true, defaultValue: 0 })
    @IsOptional()
    @Min(0)
    skip?: number;

    /** `@Allow` keeps this property when `ValidationPipe({ whitelist: true })` runs (GraphQL `@Field` alone is not enough). */
    @Field(() => Where, { nullable: true })
    @IsOptional()
    @Allow()
    where?: TWhere;
  }
  return GraphQLFilterArgs;
}
export type GraphQLFilterArgsType<TWhere extends object = any> = InstanceType<ReturnType<typeof GraphQLFilterArgs<TWhere>>>;