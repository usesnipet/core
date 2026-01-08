import "reflect-metadata";
import { Field } from "@/shared/model";

export enum Sex {
  MALE = "male",
  FEMALE = "female"
}
export enum Theme {
  LIGHT = "light",
  DARK = "dark"
}
export class SettingsDto {
  @Field({ type: "boolean", required: true })
  active: boolean;
  @Field({ type: "string", required: true })
  language: string;

  @Field({ type: "enum", enum: Theme, required: true })
  theme: Theme;

  @Field({ type: "number", required: true })
  fontSize: number;

  @Field({ type: "string", required: true })
  fontFamily: string;

  @Field({ type: "string", required: true })
  fontColor: string;

  @Field({ type: "object", additionalProperties: true, required: false })
  other?: any;
}
export class TestDto {
  @Field({ type: "string", uuid: true, required: true, source: "params" })
  id: string;

  @Field({ type: "string", required: true })
  name: string;

  @Field({ type: "number", required: true })
  age: number;

  @Field({ type: "enum", enum: Sex, required: true })
  sex: Sex;

  @Field({ type: "string", required: true })
  email: string;

  @Field({ type: "class", class: () => SettingsDto, required: true })
  settings: SettingsDto;
}
