import { Inject, Injectable, Logger } from "@nestjs/common";
import { View, ViewDto } from "./dto/base.dto";
import { FilterOptions } from "@/shared/filter-options";
import { SnipetAssetDto } from "../dto/snipet-asset.dto";
import { ChatDto, ChatRole, ViewChatDto } from "./dto/view-chat.dto";
import { GenericService } from "@/shared/generic-service";
import { SnipetAssetService } from "../assets/snipet-asset.service";
import { In } from "typeorm";
import { AssetSource } from "@/entities/asset.entity";

@Injectable()
export class ViewService extends GenericService {
  logger = new Logger(ViewService.name);

  @Inject() private readonly snipetAssetService: SnipetAssetService;

  view(filterOpts: FilterOptions<SnipetAssetDto>, data: ViewDto) {
    switch (data.view) {
      case View.CHAT:
        return this.viewChat(filterOpts);
      default:
        throw new Error("Invalid view as");
    }
  }

  private async viewChat(filterOpts: FilterOptions<SnipetAssetDto>): Promise<ViewChatDto> {
    filterOpts.where = {
      ...filterOpts.where,
      source: In([ AssetSource.AI, AssetSource.USER ])
    };
    filterOpts.order = { createdAt: "ASC" };
    filterOpts.take = filterOpts.take || 20;
    filterOpts.skip = filterOpts.skip || 0;

    const assets = await this.snipetAssetService.find(filterOpts);

    return new ViewChatDto(
      assets.map(a => new ChatDto({
        id: a.id,
        role: a.source === AssetSource.AI ? ChatRole.ASSISTANT : ChatRole.USER,
        content: a.content?.text!,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      }))
    )
  }
}