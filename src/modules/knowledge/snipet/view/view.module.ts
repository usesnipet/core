import { Module } from "@nestjs/common";
import { ViewController } from "./view.controller";
import { ViewService } from "./view.service";
import { DatabaseModule } from "@/infra/database/database.module";
import { HTTPContextModule } from "@/shared/http-context/http-context.module";
import { SnipetModule } from "../snipet.module";

@Module({
  imports: [
    HTTPContextModule,
    DatabaseModule,
    SnipetModule
  ],
  controllers: [ViewController],
  providers: [ViewService],
})
export class ViewModule {}