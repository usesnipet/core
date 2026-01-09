import { SnipetEntity } from "@/entities";
import { ExecuteSnipetContextOptions } from "../dto/execute-snipet.dto";
import { SnipetIntent } from "@/types/snipet-intent";
import { VectorStorePayload } from "@/infra/vector/payload/vector-store-payload";

export type SnipetContextRequest = {
  snipet: SnipetEntity;
  query: string;
  intent: SnipetIntent;
  executeSnipetOptions?: ExecuteSnipetContextOptions;
};

export type Memory<T = any> = {
  id: string;
  source: {
    type: "snipet";
    snipetId: string;
    knowledgeId: string;
  } | {
    type: "knowledge";
    knowledgeId: string;
  };
  content: T;
  createdAt: Date;
  updatedAt: Date;
  metadata: VectorStorePayload["metadata"];
}

export type SnipetResolvedContext = {
  snipet: Memory[];
  lastNMemories: Memory[];
  knowledge: Memory[];
};
