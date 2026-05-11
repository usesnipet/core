import { packages } from "@/packages";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";

import { ConfigService } from "../config/config.service";
import { NodeTypeService } from "../node-type/node-type.service";
import { NodeService } from "../node/node.service";
import { PackageService } from "../package/package.service";

@Injectable()
export class SyncService implements OnModuleInit {
  @Inject() private readonly packageService: PackageService;
  @Inject() private readonly nodeTypeService: NodeTypeService;
  @Inject() private readonly configService: ConfigService;
  @Inject() private readonly nodeService: NodeService;

  async onModuleInit() {
    const packageSchemas = packages.map((pkg) => pkg.schema);
    const dbPackages = await this.packageService.syncPackages(packageSchemas);
    const dbNodeTypes = await this.nodeTypeService.syncNodeTypes(
      dbPackages,
      packageSchemas.map((pkg) => pkg.nodeTypes).flat()
    );
    const dbConfigs = await this.configService.syncConfigs(
      dbPackages,
      packageSchemas.map((pkg) => pkg.configs).flat()
    );
    await this.nodeService.syncNodes(
      dbPackages,
      dbNodeTypes,
      dbConfigs,
      packageSchemas
    );
  }
}