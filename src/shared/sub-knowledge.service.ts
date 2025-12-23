import { $log } from "@/utils/$log";
import { EntityManager, FindOneOptions, ObjectLiteral } from "typeorm";

import { FilterOptions } from "./filter-options";
import { Service } from "./service";

export abstract class SubKnowledgeService<
  TEntity extends ObjectLiteral,
  TCreateDto = TEntity,
  TUpdateDto = Partial<TEntity>
> extends Service<TEntity, TCreateDto, TUpdateDto> {

  constructor(private readonly knowledgeIdField: keyof TEntity = "knowledgeId") {
    super();
  }

  override find(filterOptions: FilterOptions<TEntity>, manager?: EntityManager): Promise<TEntity[]> {
    filterOptions ??= {};
    filterOptions.where ??= {};
    filterOptions.where[this.knowledgeIdField] = this.context.params.shouldGetString("knowledgeId") as any;
    return super.find(filterOptions, manager);
  }

  override findByID(
    id: string,
    opts?: FindOneOptions<TEntity> & { manager?: EntityManager; }
  ): Promise<TEntity | null> {
    opts ??= {};
    opts.where ??= {};
    opts.where[this.knowledgeIdField as any] = this.context.params.shouldGetString("knowledgeId") as any;
    return super.findByID(id, opts);
  }

  override findFirst(
    filterOptions: FilterOptions<TEntity>,
    manager?: EntityManager
  ): Promise<TEntity | null> {
    filterOptions ??= {};
    filterOptions.where ??= {};
    filterOptions.where[this.knowledgeIdField] = this.context.params.shouldGetString("knowledgeId") as any;
    return super.findFirst(filterOptions, manager);
  }

  override findUnique(
    filterOptions: FilterOptions<TEntity>,
    manager?: EntityManager
  ): Promise<TEntity | null> {
    filterOptions ??= {};
    filterOptions.where ??= {};
    filterOptions.where[this.knowledgeIdField] = this.context.params.shouldGetString("knowledgeId") as any;
    return super.findUnique(filterOptions, manager);
  }
}