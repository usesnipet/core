import { EntityManager, FindOneOptions, FindOptionsWhere, ObjectLiteral, Repository } from "typeorm";

import { FilterOptions } from "./filter-options";

export interface ICRUDService<
  TEntity extends ObjectLiteral,
  TCreateDto = TEntity,
  TUpdateDto = Partial<TEntity>
> {

  find(filterOptions: FilterOptions<TEntity>, manager?: EntityManager): Promise<TEntity[]>;

  findUnique(filterOptions: FilterOptions<TEntity>, manager?: EntityManager): Promise<TEntity | null>;

  findFirst(filterOptions: FilterOptions<TEntity>, manager?: EntityManager): Promise<TEntity | null>;

  findByID(
    id: string,
    opts?: FindOneOptions<TEntity> & { manager?: EntityManager }
  ): Promise<TEntity | null>;

  create(input: TCreateDto, manager?: EntityManager): Promise<TEntity>
  create(input: TCreateDto[], manager?: EntityManager): Promise<TEntity[]>
  create(input: TCreateDto | TCreateDto[], manager?: EntityManager): Promise<TEntity | TEntity[]>;

  update(id: string | FindOptionsWhere<TEntity>, input: TUpdateDto, manager?: EntityManager): Promise<void>;

  delete(id: string | FindOptionsWhere<TEntity>, manager?: EntityManager): Promise<void>;
}
