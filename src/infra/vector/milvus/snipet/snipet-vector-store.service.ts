import { LLMManagerService } from "@/infra/llm-manager/llm-manager.service";
import { Injectable, Logger } from "@nestjs/common";
import { RowData } from "@zilliz/milvus2-sdk-node";
import moment from "moment";

import { MilvusService } from "../base";

import { snipetFields, snipetFunctions, snipetIndexSchema } from "./snipet-schemas";
import { SnipetVectorStorePayload } from "../../payload/snipet-vector-store-payload";

@Injectable()
export class MilvusSnipetVectorStoreService extends MilvusService<SnipetVectorStorePayload> {
  protected override logger = new Logger(MilvusSnipetVectorStoreService.name);
  constructor(llmManager: LLMManagerService) {
    super(llmManager, "snipet", SnipetVectorStorePayload, snipetFields, snipetFunctions, snipetIndexSchema)
  }

  payloadToChunk(c: SnipetVectorStorePayload): RowData
  payloadToChunk(c: SnipetVectorStorePayload[]): RowData[]
  payloadToChunk(c: SnipetVectorStorePayload | SnipetVectorStorePayload[]): RowData | RowData[] {
    const mapper = (payload: SnipetVectorStorePayload): RowData => ({
      id: payload.id,
      content: payload.content,
      fullContent: payload.fullContent,
      dense: payload.dense,
      createdAt: payload.createdAt.getTime() ?? Date.now(),
      updatedAt: payload.updatedAt.getTime() ?? Date.now(),
      metadata: payload.metadata,
      snipetId: payload.snipetId,
      knowledgeId: payload.knowledgeId,
      role: payload.role
    });

    if (Array.isArray(c)) return c.map(mapper);
    return mapper(c);
  }

  chunkToPayload(data: RowData): SnipetVectorStorePayload
  chunkToPayload(data: RowData[]): SnipetVectorStorePayload[]
  chunkToPayload(data: RowData | RowData[]): SnipetVectorStorePayload | SnipetVectorStorePayload[] {
    const mapper = (chunk: RowData): SnipetVectorStorePayload => new SnipetVectorStorePayload({
      id: chunk.id as string,
      role: chunk.role as string,
      content: chunk.content as string,
      fullContent: chunk.fullContent as string,
      dense: chunk.dense as number[],
      createdAt: moment(Number(chunk.createdAt)).toDate(),
      updatedAt: moment(Number(chunk.updatedAt)).toDate(),
      metadata: chunk.metadata as any,
      snipetId: chunk.snipetId as string,
      knowledgeId: chunk.knowledgeId as string,
    });
    if (Array.isArray(data)) return data.map(mapper);
    return mapper(data);
  }
}