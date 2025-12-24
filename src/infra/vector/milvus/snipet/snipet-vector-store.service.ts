import { Fragments, SnipetFragment } from "@/fragment";
import { LLMManagerService } from "@/infra/llm-manager/llm-manager.service";
import { Injectable, Logger } from "@nestjs/common";
import { RowData } from "@zilliz/milvus2-sdk-node";
import moment from "moment";

import { MilvusService } from "../base";

import { snipetFields, snipetFunctions, snipetIndexSchema } from "./snipet-schemas";

@Injectable()
export class MilvusSnipetVectorStoreService extends MilvusService<SnipetFragment> {
  protected override logger = new Logger(MilvusSnipetVectorStoreService.name);
  constructor(llmManager: LLMManagerService) {
    super(llmManager, "snipet", SnipetFragment, snipetFields, snipetFunctions, snipetIndexSchema)
  }

  fragmentToChunk(c: SnipetFragment | SnipetFragment[] | Fragments<SnipetFragment>): RowData[] {
    const fragments = this.toFragments(c);

    return fragments.map<RowData>(c => ({
      id: c.id,
      content: c.content,
      role: c.role,
      knowledgeId: c.knowledgeId,
      snipetId: c.snipetId,
      createdAt: c.createdAt.getTime() ?? Date.now(),
      updatedAt: c.updatedAt.getTime() ?? Date.now(),
      metadata: c.metadata,
    }));
  }

  chunkToFragments(data: RowData[]): Fragments<SnipetFragment> {
    return Fragments.fromFragmentArray(
      data.map(c => new SnipetFragment({
        id: c.id as string,
        content: c.content as string,
        role: c.role as string,
        knowledgeId: c.knowledgeId as string,
        metadata: c.metadata as any,
        snipetId: c.snipetId as string,
        createdAt: moment(Number(c.createdAt)).toDate(),
        updatedAt: moment(Number(c.updatedAt)).toDate(),
      }))
    );
  }
}