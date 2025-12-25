import { LLMManagerService } from "@/infra/llm-manager/llm-manager.service";
import { Injectable, Logger } from "@nestjs/common";
import { RowData } from "@zilliz/milvus2-sdk-node";
import moment from "moment";

import { MilvusService } from "../base";

import { sourceFields, sourceFunctions, sourceIndexSchema } from "./source-schemas";
import { SourceVectorStorePayload } from "../../payload/source-vector-store-payload";

@Injectable()
export class MilvusSourceVectorStoreService extends MilvusService<SourceVectorStorePayload> {
  protected override logger = new Logger(MilvusSourceVectorStoreService.name);

  constructor(llmManager: LLMManagerService) {
    super(llmManager, "source", SourceVectorStorePayload, sourceFields, sourceFunctions, sourceIndexSchema);
  }

  payloadToChunk(c: SourceVectorStorePayload): RowData 
  payloadToChunk(c: SourceVectorStorePayload[]): RowData[]
  payloadToChunk(c: SourceVectorStorePayload | SourceVectorStorePayload[]): RowData | RowData[] {
    const mapper = (payload: SourceVectorStorePayload): RowData => ({
      id: payload.id,
      content: payload.content,
      fullContent: payload.fullContent,
      dense: payload.dense,
      createdAt: payload.createdAt.getTime() ?? Date.now(),
      updatedAt: payload.updatedAt.getTime() ?? Date.now(),
      metadata: payload.metadata,
      seqId: payload.seqId,
      knowledgeId: payload.knowledgeId,
      connectorId: payload.connectorId,
      externalId: payload.externalId,
    });
    
    if (Array.isArray(c)) return c.map(mapper);
    return mapper(c);
  }

  chunkToPayload(data: RowData): SourceVectorStorePayload
  chunkToPayload(data: RowData[]): SourceVectorStorePayload[]
  chunkToPayload(data: RowData | RowData[]): SourceVectorStorePayload | SourceVectorStorePayload[] {
    const mapper = (chunk: RowData): SourceVectorStorePayload => new SourceVectorStorePayload({
      id: chunk.id as string,
      content: chunk.content as string,
      fullContent: chunk.fullContent as string,
      dense: chunk.dense as number[],
      createdAt: moment(Number(chunk.createdAt)).toDate(),
      updatedAt: moment(Number(chunk.updatedAt)).toDate(),
      metadata: chunk.metadata as any,
      seqId: chunk.seqId as number,
      knowledgeId: chunk.knowledgeId as string,
      connectorId: chunk.connectorId as string,
      externalId: chunk.externalId as string,
    });
    if (Array.isArray(data)) return data.map(mapper);
    return mapper(data);
  }
}
