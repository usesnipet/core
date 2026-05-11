import { packages } from "@/packages";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";

import { ConfigService } from "../config/config.service";
import { NodeTypeService } from "../node-type/node-type.service";
import { PackageService } from "../package/package.service";

@Injectable()
export class SyncService implements OnModuleInit {
  @Inject() private readonly packageService: PackageService;
  @Inject() private readonly nodeTypeService: NodeTypeService;
  @Inject() private readonly configService: ConfigService;

  async onModuleInit() {
    const packageSchemas = packages.map((pkg) => pkg.schema);
    const dbPackages = await this.packageService.syncPackages(packageSchemas);
    await this.nodeTypeService.syncNodeTypes(dbPackages, packageSchemas.map((pkg) => pkg.nodeTypes).flat());
    await this.configService.syncConfigs(dbPackages, packageSchemas.map((pkg) => pkg.configs).flat());
  }
}