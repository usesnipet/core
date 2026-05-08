import { Controller, Get, Post } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { CoreManagerService } from "./core-manager.service";

@ApiTags("core")
@Controller("core")
export class CoreController {
  constructor(private readonly manager: CoreManagerService) {}

  @Post("reload")
  @ApiOkResponse({ description: "Reload core registry from database" })
  async reload() {
    await this.manager.reload();
    return this.manager.snapshot();
  }

  @Get("registry")
  @ApiOkResponse({ description: "Registry snapshot" })
  snapshot() {
    return this.manager.snapshot();
  }
}

