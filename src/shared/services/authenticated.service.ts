import { ObjectLiteral } from "typeorm";
import { Service } from "../service";

export abstract class AuthenticatedService<
  TEntity extends ObjectLiteral,
  TCreateDto = TEntity,
  TUpdateDto = Partial<TEntity>
> extends Service<TEntity, TCreateDto, TUpdateDto> {
  
}