import { Request } from "express";

import { applyDecorators, Body, createParamDecorator, ExecutionContext, Param } from "@nestjs/common";

import { CONTEXT_FIELDS_KEY } from "./context";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { BadRequestException } from "@nestjs/common";

export function validateAndSanitizeDto<T>(dto: ClassConstructor<any>, payload: unknown): T {
  const data = Object.assign(new dto(), payload);
  const instance = plainToInstance(dto, data, { excludeExtraneousValues: true, enableImplicitConversion: true });

  const errors = validateSync(instance as any, { forbidNonWhitelisted: true });
  if (errors.length) throw new BadRequestException(errors);

  return instance;
}

export const ApplyFromContext = createParamDecorator((Dto: ClassConstructor<any>, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const contextSources = {
    params: request.params,
    query: request.query,
  };
  const data = request.body ?? {};
  const fields = Reflect.getMetadata(CONTEXT_FIELDS_KEY, Dto) || [];
    
  for (const { propertyKey, source, key } of fields) {
    const sourceValue = contextSources[source];
    if (!sourceValue) continue;
    const k = key || propertyKey
    const contextValue = k && typeof sourceValue === "object" ? sourceValue[k] : sourceValue;

    if (contextValue !== undefined) data[propertyKey] = contextValue;
  }
  const validatedData = validateAndSanitizeDto(Dto, data); 
  request.body = validatedData;
});

export const HttpBody = (dto: ClassConstructor<any>) => {
  const httpBodyFn = ApplyFromContext(dto);
  const bodyFn = Body();
  return (target: any, key: string, index: number) => {
    httpBodyFn(target, key, index);
    bodyFn(target, key, index);
  };
};