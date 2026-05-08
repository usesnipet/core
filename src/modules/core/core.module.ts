import { Runner, RunnerOptions } from "@/core/runtime/runner";
import { ConfigModule } from "@/modules/config/config.module";
import { FlowModule } from "@/modules/flow/flow.module";
import { NodeTypeModule } from "@/modules/node-type/node-type.module";
import { NodeModule } from "@/modules/node/node.module";
import { InternalPackage } from "@/packages/internal";
import { Constructable } from "@/types";
import { Module } from "@nestjs/common";

import { CoreManagerService } from "./core-manager.service";
import { CORE_RUNNER_CATALOG } from "./core.constants";
import { CoreController } from "./core.controller";
import { RegistryService, RunnerCatalog } from "./registry.service";
import { RuntimeStore } from "./runtime-store";
import { RuntimeController } from "./runtime.controller";
import { RuntimeService } from "./runtime.service";

@Module({
  imports: [ConfigModule, FlowModule, NodeModule, NodeTypeModule],
  controllers: [CoreController, RuntimeController],
  providers: [
    RuntimeStore,
    RuntimeService,
    RegistryService,
    CoreManagerService,
    {
      provide: CORE_RUNNER_CATALOG,
      useFactory: (): RunnerCatalog => {
        // Start with internal package runners; other packages can extend later.
        return [...InternalPackage.runners] as unknown as Array<Constructable<Runner, [RunnerOptions]>>;
      },
    },
  ],
})
export class CoreModule {

}