import { EntityManager, FindOneOptions, ObjectLiteral } from "typeorm";
import { Service } from "../service";
import { FilterOptions } from "../filter-options";
import { UnauthorizedException } from "@nestjs/common";

export abstract class SubKnowledgeService<
  TEntity extends ObjectLiteral,
  TCreateDto = TEntity,
  TUpdateDto = Partial<TEntity>
> extends Service<TEntity, TCreateDto, TUpdateDto> {

  constructor(private readonly knowledgeIdField: keyof TEntity = "knowledgeId") {
    super();
  }

  private getApiKey() {
    const apiKey = this.context.apiKey;
    if (!apiKey) throw new UnauthorizedException();
    return apiKey;
  }

  override find(filterOptions: FilterOptions<TEntity>, manager?: EntityManager): Promise<TEntity[]> {
    const knowledgeId = this.context.params.shouldGetString("knowledgeId");
    if (!this.getApiKey().canAccessKnowledgeBase(knowledgeId)) throw new UnauthorizedException();
    filterOptions ??= {};
    filterOptions.where ??= {};
    filterOptions.where[this.knowledgeIdField] = knowledgeId as any;
    return super.find(filterOptions, manager);
  }

  override findByID(
    id: string,
    opts?: FindOneOptions<TEntity> & { manager?: EntityManager; }
  ): Promise<TEntity | null> {
    const knowledgeId = this.context.params.shouldGetString("knowledgeId");
    if (!this.getApiKey().canAccessKnowledgeBase(knowledgeId)) throw new UnauthorizedException();
    opts ??= {};
    opts.where ??= {};
    opts.where[this.knowledgeIdField as any] = knowledgeId as any;
    return super.findByID(id, opts);
  }

  override findFirst(
    filterOptions: FilterOptions<TEntity>,
    manager?: EntityManager
  ): Promise<TEntity | null> {
    const knowledgeId = this.context.params.shouldGetString("knowledgeId");
    if (!this.getApiKey().canAccessKnowledgeBase(knowledgeId)) throw new UnauthorizedException();
    filterOptions ??= {};
    filterOptions.where ??= {};
    filterOptions.where[this.knowledgeIdField] = knowledgeId as any;
    return super.findFirst(filterOptions, manager);
  }

  override findUnique(
    filterOptions: FilterOptions<TEntity>,
    manager?: EntityManager
  ): Promise<TEntity | null> {
    const knowledgeId = this.context.params.shouldGetString("knowledgeId");
    if (!this.getApiKey().canAccessKnowledgeBase(knowledgeId)) throw new UnauthorizedException();
    filterOptions ??= {};
    filterOptions.where ??= {};
    filterOptions.where[this.knowledgeIdField] = knowledgeId as any;
    return super.findUnique(filterOptions, manager);
  }
}