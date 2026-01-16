import { SnipetEntity } from "@/entities";
import { SnipetIntent } from "@/types/snipet-intent";
import { VectorStorePayload } from "@/infra/vector/payload/vector-store-payload";
import { ExecuteSnipetContextOptions } from "@/entities/execution.entity";

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
