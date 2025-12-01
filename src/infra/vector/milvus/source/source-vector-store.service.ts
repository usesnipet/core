import moment from "moment";

import { Fragments, SourceFragment } from "@/fragment";
import { LLMManagerService } from "@/infra/llm-manager/llm-manager.service";
import { Injectable, Logger } from "@nestjs/common";
import { RowData, SearchResultData } from "@zilliz/milvus2-sdk-node";

import { MilvusService } from "../base";
import { sourceFields, sourceFunctions, sourceIndexSchema } from "./source-schemas";

@Injectable()
export class MilvusSourceVectorStoreService extends MilvusService<SourceFragment> {
  protected override logger = new Logger(MilvusSourceVectorStoreService.name);

  constructor(llmManager: LLMManagerService) {
    super(llmManager, "source", SourceFragment, sourceFields, sourceFunctions, sourceIndexSchema);
  }

  fragmentToChunk(c: SourceFragment | SourceFragment[] | Fragments<SourceFragment>): RowData[] {
    const fragments = this.toFragments(c);

    return fragments.map<RowData>(c => ({
      id: c.id,
      seqId: c.seqId,
      content: c.content,
      connectorId: c.connectorId,
      externalId: c.externalId,
      knowledgeId: c.knowledgeId,
      createdAt: c.createdAt.getTime() ?? Date.now(),
      updatedAt: c.updatedAt.getTime() ?? Date.now(),
      metadata: c.metadata
    }));
  }

  searchResultToFragment(data: SearchResultData[]): Fragments<SourceFragment> {
    return Fragments.fromFragmentArray(
      data.map(c => new SourceFragment({
        content: c.content,
        id: c.id,
        seqId: c.seqId,
        connectorId: c.connectorId,
        externalId: c.externalId,
        knowledgeId: c.knowledgeId,
        metadata: c.metadata,
        createdAt: moment(Number(c.createdAt)).toDate(),
        updatedAt: moment(Number(c.updatedAt)).toDate()
      }))
    );
  }
}
