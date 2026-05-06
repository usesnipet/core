import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { FilterOptions } from './filter-options';
import { HttpFilterConverter, type FilterHttpConfig } from './http-filter.converter';

export const Filter = (config: FilterHttpConfig = {}) =>
  createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): FilterOptions<any> => {
      const req = ctx.switchToHttp().getRequest();
      const query = (req?.query ?? {}) as Record<string, any>;
      return HttpFilterConverter.fromQuery(query, config);
    }
  )();

