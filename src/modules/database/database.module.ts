import { Global, DynamicModule } from '@nestjs/common';
import {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
} from './database.definition';
import { DatabaseService } from './database.service';
import { DatabaseConfig } from './database.interface';
import { TransactionManager } from './transaction-manager';

@Global()
export class DatabaseModule extends ConfigurableModuleClass {
  static register(options: typeof OPTIONS_TYPE): DynamicModule {
    const { providers = [], exports = [], ...props } = super.register(options);
    return {
      ...props,
      providers: [
        ...providers,
        DatabaseService,
        TransactionManager,
        {
          provide: options?.tag || 'default',
          useFactory: async (drizzleService: DatabaseService) => {
            return await drizzleService.getDrizzle(options);
          },
          inject: [DatabaseService],
        },
      ],
      exports: [...exports, options?.tag || 'default', TransactionManager],
    };
  }
  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    const {
      providers = [],
      exports = [],
      ...props
    } = super.registerAsync(options);
    return {
      ...props,
      providers: [
        ...providers,
        DatabaseService,
        TransactionManager,
        {
          provide: options?.tag || 'default',
          useFactory: async (
            drizzleService: DatabaseService,
            config: DatabaseConfig
          ) => {
            return await drizzleService.getDrizzle(config);
          },
          inject: [DatabaseService, MODULE_OPTIONS_TOKEN],
        },
      ],
      exports: [...exports, options?.tag || 'default', TransactionManager],
    };
  }
}