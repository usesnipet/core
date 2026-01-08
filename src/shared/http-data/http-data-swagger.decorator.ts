import {
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiExtraModels,
  getSchemaPath
} from "@nestjs/swagger";
import { applyDecorators } from "@nestjs/common";
import { getAllSources, isClassType } from "./utils";
import { Constructor } from "@/types/constructor";


function generateSwaggerDecoratorsFor(DtoClass: new () => any) {
  const sources = getAllSources(DtoClass);

  const bodyProps: string[] = [];
  const queryProps: string[] = [];
  const paramProps: string[] = [];

  const nestedClasses: any[] = [];
  
  for (const { key, source } of sources) {
    if (isClassType(DtoClass, key)) {
      const nestedType = Reflect.getMetadata("design:type", DtoClass.prototype, key);
      nestedClasses.push(nestedType);
      continue;
    }

    if (source === "body") bodyProps.push(key);
    if (source === "query") queryProps.push(key);
    if (source === "params") paramProps.push(key);
  }

  const decorators: MethodDecorator[] = [];

  decorators.push(ApiExtraModels(DtoClass));

  for (const nested of nestedClasses) {
    decorators.push(...generateSwaggerDecoratorsFor(nested));
  }
  
  if (bodyProps.length > 0) {
    decorators.push(
      ApiBody({
        schema: {
          type: "object",
          properties: bodyProps.reduce((acc, key) => {
            acc[key] = {
              $ref: `${getSchemaPath(DtoClass)}#/properties/${key}`
            };
            return acc;
          }, {})
        }
      })
    );
  }

  for (const key of queryProps) {
    decorators.push(
      ApiQuery({
        name: key,
        required: false,
        schema: {
          $ref: `${getSchemaPath(DtoClass)}#/properties/${key}`
        }
      })
    );
  }

  for (const key of paramProps) {
    decorators.push(
      ApiParam({
        name: key,
        required: true,
        // schema: {
        //   $ref: `${getSchemaPath(DtoClass)}#/properties/${key}`
        // }
      })
    );
  }

  return decorators;
}

export function HTTPDataSwagger(DtoClass: Constructor<any>) {
  return applyDecorators(...generateSwaggerDecoratorsFor(DtoClass));
}
