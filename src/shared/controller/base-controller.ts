import { Constructor } from "@/types/constructor";
import { Param, ParseUUIDPipe } from "@nestjs/common";
import { ApiBody, ApiSecurity } from "@nestjs/swagger";
import { ObjectLiteral } from "@/types/object-literal";

import { FilterOptions } from "../filter-options";
import { Service } from "../service";

import { HttpDelete, HttpGet, HttpPost, HttpPut, Permissions } from "./decorators";
import { ApiFilterQuery } from "./decorators/api-filter-options";
import { ControllerFilter, Filter } from "./decorators/filter";
import {
  getDefaultCreateResponses, getDefaultDeleteResponses, getDefaultFindByIDResponses, getDefaultFindResponses,
  getDefaultUpdateResponses
} from "./default-response";
import { GenericResponse } from "./generic-response";
import { ControllerResponses, RequiredPermissions } from "./types";
import { HTTPData } from "../http-data/http-data.decorator";

export function BaseController<
  TEntity extends ObjectLiteral,
  TCreateDto = TEntity,
  TUpdateDto = Partial<TEntity>
>({
  entity,
  createDto,
  updateDto,
  idField = "id",
  allowedFilters = [],
  allowedRelations = [],
  ignore = [],
  requiredPermissions,
  responses = {
    create: getDefaultCreateResponses(entity),
    find: getDefaultFindResponses(entity),
    findByID: getDefaultFindByIDResponses(entity),
    update: getDefaultUpdateResponses(entity),
    delete: getDefaultDeleteResponses(entity)
  },
}: {
  entity: Constructor<TEntity>;
  createDto?: Constructor<TCreateDto>;
  updateDto?: Constructor<TUpdateDto>;
  idField?: string;
  allowedFilters?: (keyof TEntity)[];
  allowedRelations?: (keyof TEntity)[];
  ignore?: Array<"find" | "findByID" | "create" | "update" | "delete">;
  responses?: ControllerResponses;
  requiredPermissions?: RequiredPermissions;
}) {
  if (!createDto) createDto = entity as unknown as Constructor<TCreateDto>;
  if (!updateDto) updateDto = entity as unknown as Constructor<TUpdateDto>;
  @ControllerFilter({ allowedFilters, allowedRelations })
  abstract class Base {
    constructor(public readonly service: Service<TEntity>) {}

    @ApiFilterQuery([], allowedRelations, false)
    @HttpGet(":id", { ignore: ignore.includes("findByID"), responses: responses.findByID })
    @Permissions(requiredPermissions?.findByID)
    async findByID(@Param(idField) id: string): Promise<TEntity | null> {
      return this.service.findByID(id);
    }

    @ApiFilterQuery(allowedFilters, allowedRelations)
    @HttpGet("", { ignore: ignore.includes("find"), responses: responses.find })
    @Permissions(requiredPermissions?.find)
    async findMany(@Filter() filterOpts: FilterOptions<TEntity>): Promise<TEntity[]> {
      return this.service.find(filterOpts);
    }

    @HttpPost("", { ignore: ignore.includes("create"), responses: responses.create })
    @ApiBody({ type: createDto })
    @Permissions(requiredPermissions?.create)
    async create(@HTTPData(createDto ?? entity) body: TCreateDto): Promise<TEntity> {
      return this.service.create(body as unknown as TEntity);
    }

    @HttpPut(":id", { ignore: ignore.includes("update"), responses: responses.update })
    @ApiBody({ type: updateDto })
    @Permissions(requiredPermissions?.update)
    async update(@Param("id", ParseUUIDPipe) id: string, @HTTPData(updateDto ?? entity) body: TUpdateDto) {
      await this.service.update(id, body as unknown as TEntity);
      return new GenericResponse("Update successful");
    }

    @HttpDelete(":id", { ignore: ignore.includes("delete"), responses: responses.delete })
    @Permissions(requiredPermissions?.delete)
    async delete(@Param("id", ParseUUIDPipe) id: string) {
      await this.service.delete(id);
      return new GenericResponse("Delete successful");
    }
  }
  return Base;
}
