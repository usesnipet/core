import { AssetDomain, AssetEntity } from "@/entities/asset.entity";
import { fingerprint } from "@/lib/fingerprint";
import { FilterOptions } from "@/shared/filter-options";
import { GenericService } from "@/shared/generic-service";
import { FindOneOptions, EntityManager, Repository, FindOptionsWhere } from "typeorm";

export abstract class AssetService<AssetType> extends GenericService {
  repository(manager?: EntityManager): Repository<AssetEntity> {
    return manager ? manager.getRepository(AssetEntity) : this.dataSource.getRepository(AssetEntity);
  }

  constructor(protected domain: AssetDomain) {
    super();
  }

  get domainFilter() {
    return { domain: this.domain };
  }

  abstract fromEntity(entity: AssetEntity): AssetType;
  abstract toEntity(asset: AssetType): AssetEntity;

  hash(text: string): string {
    return fingerprint(text);
  }

  async find(filterOptions: FilterOptions<AssetType>, manager?: EntityManager): Promise<AssetType[]> {
    const res = await this.repository(manager).find(filterOptions);
    return res.map(this.fromEntity);
  }

  async findUnique(filterOptions: FilterOptions<AssetType>, manager?: EntityManager): Promise<AssetType | null> {
    const res = await this.repository(manager).findOne(filterOptions);
    return res ? this.fromEntity(res) : null;
  }

  async findByID(id: string, opts?: (FindOneOptions<AssetType> & { manager?: EntityManager; }) | undefined): Promise<AssetType | null> {
    const res = await this.repository(opts?.manager)
      .findOne({ ...opts as any, where: { id, ...opts?.where, ...this.domainFilter } });

    return res ? this.fromEntity(res) : null;
  }

  async findFirst(filterOptions: FilterOptions<AssetType>, manager?: EntityManager): Promise<AssetType | null> {
    filterOptions.take = 1;
    filterOptions.skip = 0;

    const data = await this.repository(manager).find(filterOptions);

    return data?.length === 0 ? null : this.fromEntity(data?.[0]);
  }

  async create(input: AssetType, manager?: EntityManager): Promise<AssetType> {
    return this.fromEntity(await this.repository(manager).save(this.toEntity(input)));
  }

  async update(
    criteria: string | FindOptionsWhere<AssetType>,
    input: AssetType,
    manager?: EntityManager
  ): Promise<void> {
    await this.repository(manager).update(criteria, this.toEntity(input));
  }

  async delete(id: string | FindOptionsWhere<AssetType>, manager?: EntityManager): Promise<void> {
    await this.repository(manager).delete(id);
  }
}