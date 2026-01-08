import { Constructor } from "@/types/constructor";
import { applyDecorators } from "@nestjs/common";
import { Expose } from "class-transformer";
import "reflect-metadata";

export const SOURCE_FIELDS_KEY = Symbol("source:fields");

export interface SourceFieldOptions {
  source: "params" | "query" | "apiKey" | "body";
  key: string;
}

export const getSourceFields = (target: any):Array<SourceFieldOptions> => {
  return Reflect.getMetadata(SOURCE_FIELDS_KEY, target) || [];
};

export function SourceField(options: Partial<SourceFieldOptions>): PropertyDecorator {
  return applyDecorators(
    Expose(),
    (target: Object, propertyKey: string | symbol) => {
      const constructor = target.constructor;
 
      const existing = getSourceFields(constructor);
 
      if (!existing.find((item: any) => item.propertyKey === propertyKey)) {
        const opts: SourceFieldOptions = {
          key: options.key || propertyKey.toString(),
          source: options.source || "body",
        }
        existing.push(opts);
        Reflect.defineMetadata(SOURCE_FIELDS_KEY, existing, constructor);
      }
   }
  )
}

export const FromQuery   = (key?: string) => SourceField({ source: "query",  key });
export const FromParams  = (key?: string) => SourceField({ source: "params", key });
export const FromApiKey  = (key?: string) => SourceField({ source: "apiKey", key });
export const FromBody    = (key?: string) => SourceField({ source: "body",   key });