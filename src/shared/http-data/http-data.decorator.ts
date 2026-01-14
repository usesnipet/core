// http-data.decorator.ts
import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { collectDataForDTO } from "./utils";
import { AuthRequest } from "@/types/request";
import { Constructor } from "@/types/constructor";


export const HTTPData = (DtoClass: Constructor<any>) =>
  createParamDecorator((_: unknown, ctx: ExecutionContext) => {
    const request: AuthRequest = ctx.switchToHttp().getRequest();
    const collected = collectDataForDTO(DtoClass, request);

    const instance = plainToInstance(DtoClass, collected, { enableImplicitConversion: true, excludeExtraneousValues: true });

    const errors = validateSync(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
      validationError: { target: false },
    });

    if (errors.length > 0) throw new BadRequestException(errors);

    return instance;
  })();
