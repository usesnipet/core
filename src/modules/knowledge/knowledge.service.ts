import { KnowledgeEntity } from "@/entities";
import { FilterOptions } from "@/shared/filter-options";
import { Service } from "@/shared/service";
import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { EntityManager, FindOneOptions } from "typeorm";

@Injectable()
export class KnowledgeService extends Service<KnowledgeEntity> {
  logger = new Logger(KnowledgeService.name);
  entity = KnowledgeEntity;

  private getApiKey() {
    const apiKey = this.context.apiKey;
    if (!apiKey) throw new UnauthorizedException();
    return apiKey;
  }

  override find(
    filterOptions: FilterOptions<KnowledgeEntity>,
    manager?: EntityManager
  ): Promise<KnowledgeEntity[]> {

    filterOptions ??= {};
    filterOptions.where ??= {};
    filterOptions.where.apiKeyAssignments = { apiKeyId: this.getApiKey().id };
    return this.repository(manager).find(filterOptions);
  }

  override findByID(
    id: string,
    opts?: (Omit<FindOneOptions<KnowledgeEntity>, "where"> & { manager?: EntityManager; })
  ): Promise<KnowledgeEntity | null> {
    if (this.getApiKey().canAccessKnowledgeBase(id)) {
      return this.repository(opts?.manager).findOne({ where: { id }, ...opts });
    }
    throw new UnauthorizedException("You do not have permission to access this knowledge");
  }

  override findFirst(
    filterOptions: FilterOptions<KnowledgeEntity>,
    manager?: EntityManager
  ): Promise<KnowledgeEntity | null> {
    filterOptions ??= {};
    filterOptions.where ??= {};
    filterOptions.where.apiKeyAssignments = { apiKeyId: this.getApiKey().id };
    return this.repository(manager).findOne(filterOptions);
  }

  override findUnique(
    filterOptions: FilterOptions<KnowledgeEntity>,
    manager?: EntityManager
  ): Promise<KnowledgeEntity | null> {
    filterOptions ??= {};
    filterOptions.where ??= {};
    filterOptions.where.apiKeyAssignments = { apiKeyId: this.getApiKey().id };
    return this.repository(manager).findOne(filterOptions);
  }
}