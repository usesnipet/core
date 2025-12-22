import { Field } from "@/shared/model";
import { ApiExtraModels } from "@nestjs/swagger";
import z from "zod";

export enum SchemaFieldType {
  OBJECT = "object",
  ARRAY = "array",
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
}

export class FieldSchema {
  @Field({ type: "enum", enum: SchemaFieldType, description: "the type of the field", required: true })
  type: SchemaFieldType;

  @Field({ type: "string", required: false, description: "the description of the field" })
  description?: string;
}

export class StringFieldSchema extends FieldSchema {
  override type = SchemaFieldType.STRING;
}
export class NumberFieldSchema extends FieldSchema {
  override type = SchemaFieldType.NUMBER;
}
export class BooleanFieldSchema extends FieldSchema {
  override type = SchemaFieldType.BOOLEAN;
}
export class ObjectFieldSchema extends FieldSchema {
  override type = SchemaFieldType.OBJECT;

  @Field({
    type: "oneOf",
    classes: [
      () => StringFieldSchema,
      () => NumberFieldSchema,
      () => BooleanFieldSchema,
      () => ObjectFieldSchema,
    ],
    description: "the schema of the object",
    required: true,
  })
  schema: FieldSchema;
}
export class ArrayFieldSchema extends FieldSchema {
  override type = SchemaFieldType.ARRAY;

  @Field({
    type: "oneOf",
    classes: [
      () => StringFieldSchema,
      () => NumberFieldSchema,
      () => BooleanFieldSchema,
      () => ArrayFieldSchema,
      () => ObjectFieldSchema,
    ],
    description: "the schema of the array",
    required: true,
  })
  schema: FieldSchema;
}


@ApiExtraModels(StringFieldSchema, NumberFieldSchema, BooleanFieldSchema, ObjectFieldSchema, ArrayFieldSchema)
export class StructuredOutputDto {
  @Field({ type: "string", description: "The text to be processed", required: true })
  text: string;

  @Field({
    type: "oneOf",
    classes: [
      () => StringFieldSchema,
      () => NumberFieldSchema,
      () => BooleanFieldSchema,
      () => ArrayFieldSchema,
      () => ObjectFieldSchema,
    ],
    description: "the schema of the object",
    required: true,
  })
  schema: FieldSchema;

  toZodObject(): z.ZodObject<any> {
    throw new Error("Not implemented");
  }
}