import { SnipetEntity } from "@/entities";
import { SnipetResolvedContext } from "../context-resolver/context-resolver.types";

export interface ActionResolverRequest {
  snipet: SnipetEntity;
  context: SnipetResolvedContext;
  query: string;
}

export interface Action {
  id: string;
  name: string;
  description: string;
  risk: number; // 0 to 1
}

export interface ActionResolved {
  actions: Action[];
}