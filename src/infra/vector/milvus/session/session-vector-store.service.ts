import moment from "moment";

import { Fragments, SessionFragment } from "@/fragment";
import { LLMManagerService } from "@/infra/llm-manager/llm-manager.service";
import { Injectable, Logger } from "@nestjs/common";
import { RowData, SearchResultData } from "@zilliz/milvus2-sdk-node";

import { MilvusService } from "../base";
import { chatFunctions, sessionFields, sessionIndexSchema } from "./session-schemas";

@Injectable()
export class MilvusSessionVectorStoreService extends MilvusService<SessionFragment> {
  protected override logger = new Logger(MilvusSessionVectorStoreService.name);
  constructor(llmManager: LLMManagerService) {
    super(llmManager, "session", SessionFragment, sessionFields, chatFunctions, sessionIndexSchema)
  }

  fragmentToChunk(c: SessionFragment | SessionFragment[] | Fragments<SessionFragment>): RowData[] {
    const fragments = this.toFragments(c);

    return fragments.map<RowData>(c => ({
      id: c.id,
      content: c.content,
      role: c.role,
      knowledgeId: c.knowledgeId,
      sessionId: c.sessionId,
      createdAt: c.createdAt.getTime() ?? Date.now(),
      updatedAt: c.updatedAt.getTime() ?? Date.now(),
      metadata: c.metadata
    }));
  }

  chunkToFragments(data: RowData[]): Fragments<SessionFragment> {
    return Fragments.fromFragmentArray(
      data.map(c => new SessionFragment({
        id: c.id as string,
        content: c.content as string,
        role: c.role as string,
        knowledgeId: c.knowledgeId as string,
        metadata: c.metadata as any,
        sessionId: c.sessionId as string,
        createdAt: moment(Number(c.createdAt)).toDate(),
        updatedAt: moment(Number(c.updatedAt)).toDate(),
      }))
    );
  }

  async searchLastNMessages(chatId: string, n: number): Promise<Fragments<SessionFragment>> {
    const filter = `chatId == "${chatId}"`;

    const result = await this.client.search({
      collection_name: this.collectionName,
      filter,
      data: {},
      topk: n,
    });

    return this.chunkToFragments(result.results);
  }
}