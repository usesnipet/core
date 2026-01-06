import { SnipetEntity } from "@/entities";
import { ExecuteSnipetContextOptions } from "../dto/execute-snipet.dto";
import { SnipetIntent } from "@/types/snipet-intent";

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
  metadata: any;
}

export type SnipetResolvedContext = {
  snipet: Memory[];
  lastNMemories: Memory[];
  knowledge: Memory[];
};
