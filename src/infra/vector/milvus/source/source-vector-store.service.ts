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
      ...payload,
      createdAt: payload.createdAt.getTime() ?? Date.now(),
      updatedAt: payload.updatedAt.getTime() ?? Date.now(),
    });

    if (Array.isArray(c)) return c.map(mapper);
    return mapper(c);
  }

  chunkToPayload(data: RowData): SourceVectorStorePayload
  chunkToPayload(data: RowData[]): SourceVectorStorePayload[]
  chunkToPayload(data: RowData | RowData[]): SourceVectorStorePayload | SourceVectorStorePayload[] {
    const mapper = (chunk: RowData): SourceVectorStorePayload => new SourceVectorStorePayload({
      ...chunk as any,
      createdAt: moment(Number(chunk.createdAt)).toDate(),
      updatedAt: moment(Number(chunk.updatedAt)).toDate(),
    });
    if (Array.isArray(data)) return data.map(mapper);
    return mapper(data);
  }
}
